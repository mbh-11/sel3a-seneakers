-- ==========================================
-- 1. تحديث قائمة المنتجات (Nike, NB, Asics)
-- ==========================================
TRUNCATE TABLE products;

INSERT INTO products (name, brand, price, image, description, sizes, colors, category, rating, reviews_count)
VALUES 
('Air Jordan 1 Chicago', 'Nike', 28000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 'The legendary Air Jordan 1 Chicago.', '[40, 41, 42, 43, 44, 45]'::jsonb, '["Red/White"]'::jsonb, 'Basketball', 4.9, 156),
('New Balance 550 Grey', 'New Balance', 22000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800', 'Classic retro style.', '[39, 40, 41, 42, 43]'::jsonb, '["Grey/White"]'::jsonb, 'Lifestyle', 4.7, 94),
('Asics Gel-Kalyano 29', 'Asics', 26000, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', 'High-performance running shoe.', '[40, 41, 42, 43, 44]'::jsonb, '["Black/Volt"]'::jsonb, 'Performance', 4.8, 62),
('Nike Air Max 270', 'Nike', 24000, 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800', 'Modern sleek design.', '[40, 41, 42, 43, 44]'::jsonb, '["Black/White"]'::jsonb, 'Casual', 4.5, 210);

-- ==========================================
-- 2. إصلاح بنية جدول الطلبات (Columns)
-- ==========================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_details jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS date date DEFAULT now();

-- ==========================================
-- 3. ضبط الحماية والسياسات (RLS)
-- ==========================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات سابقة لتجنب التكرار
DROP POLICY IF EXISTS "Allow anonymous inserts" ON orders;
DROP POLICY IF EXISTS "Restrict select to authenticated users" ON orders;
DROP POLICY IF EXISTS "Full access for authenticated users" ON orders;

-- السماح للزبائن بتقديم طلباتهم
CREATE POLICY "Allow anonymous inserts" ON orders FOR INSERT TO anon WITH CHECK (true);

-- حصر رؤية الطلبات للأدمن فقط
CREATE POLICY "Restrict select to authenticated users" ON orders FOR SELECT TO authenticated USING (true);

-- منح الأدمن كامل الصلاحيات
CREATE POLICY "Full access for authenticated users" ON orders FOR ALL TO authenticated USING (true);

-- ==========================================
-- 4. وظائف الأدمن (RPC) لتخطي RLS بأمان
-- ==========================================
CREATE OR REPLACE FUNCTION get_admin_orders()
RETURNS SETOF orders LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$ SELECT * FROM orders ORDER BY created_at DESC; $$;

CREATE OR REPLACE FUNCTION get_admin_products()
RETURNS SETOF products LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$ SELECT * FROM products ORDER BY created_at DESC; $$;

-- وظيفة لتحديث حالة الطلب بأمان (تتخطى RLS)
CREATE OR REPLACE FUNCTION update_order_status(order_id_param BIGINT, new_status_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- لتنفيذ الأمر بصلاحيات كاملة
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET status = new_status_param
  WHERE id = order_id_param;
END;
$$;

-- ==========================================
-- 5. نظام إدارة المخزون (Inventory Management)
-- ==========================================

-- إضافة عمود المخزون
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '{}'::jsonb;

-- وظيفة RPC لمعالجة الطلب وخصم المخزون
CREATE OR REPLACE FUNCTION process_order_with_stock(order_data_param JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_order_id BIGINT;
    item RECORD;
    current_inventory JSONB;
    new_qty INT;
BEGIN
    INSERT INTO orders (
        customer, phone, state, address, total, items, shipping_details, status, date
    ) VALUES (
        order_data_param->>'customer',
        order_data_param->>'phone',
        order_data_param->>'state',
        order_data_param->>'address',
        (order_data_param->>'total')::numeric,
        (order_data_param->'items'),
        (order_data_param->'shipping_details'),
        COALESCE(order_data_param->>'status', 'pending'),
        COALESCE((order_data_param->>'date')::date, now()::date)
    ) RETURNING id INTO new_order_id;

    FOR item IN SELECT * FROM jsonb_to_recordset(order_data_param->'items') AS x(id TEXT, size TEXT, quantity INT)
    LOOP
        SELECT inventory INTO current_inventory FROM products WHERE id::text = item.id;
        new_qty := GREATEST(0, COALESCE((current_inventory->>item.size)::int, 0) - COALESCE(item.quantity, 1));
        UPDATE products
        SET inventory = jsonb_set(COALESCE(inventory, '{}'::jsonb), ARRAY[item.size], to_jsonb(new_qty))
        WHERE id::text = item.id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'order_id', new_order_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
