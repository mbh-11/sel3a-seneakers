-- ==========================================
-- Inventory Management System Update (Fixed for Text/BigInt IDs)
-- ==========================================

-- 1. إضافة عمود المخزون لجدول المنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '{}'::jsonb;

-- 2. تحديث المنتجات الحالية ليكون لديها مخزون افتراضي (10 قطع لكل مقاس)
UPDATE products 
SET inventory = (
  SELECT jsonb_object_agg(size, 10) 
  FROM jsonb_array_elements_text(COALESCE(sizes, '[]'::jsonb)) AS size
)
WHERE inventory = '{}'::jsonb OR inventory IS NULL;

-- 3. وظيفة RPC لمعالجة الطلب وخصم المخزون في عملية واحدة (Atomic Transaction)
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
    -- أ. إدراج الطلب في جدول الطلبات
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

    -- ب. تحديث المخزون لكل منتج في الطلب
    FOR item IN SELECT * FROM jsonb_to_recordset(order_data_param->'items') AS x(id TEXT, size TEXT, quantity INT)
    LOOP
        -- جلب المخزون الحالي (المقارنة بصيغة نصية لتجنب تعارض الـ UUID)
        SELECT inventory INTO current_inventory FROM products WHERE id::text = item.id;
        
        -- حساب الكمية الجديدة
        new_qty := GREATEST(0, COALESCE((current_inventory->>item.size)::int, 0) - COALESCE(item.quantity, 1));
        
        -- تحديث حقل JSONB
        UPDATE products
        SET inventory = jsonb_set(
            COALESCE(inventory, '{}'::jsonb),
            ARRAY[item.size],
            to_jsonb(new_qty)
        )
        WHERE id::text = item.id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'order_id', new_order_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
