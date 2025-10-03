-- Step 1: Drop the existing constraint that's blocking our update
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- Step 2: Update existing payment methods to lowercase
UPDATE public.payments 
SET payment_method = LOWER(payment_method);

-- Step 3: Add the new constraint with correct values
ALTER TABLE public.payments
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('cash', 'upi', 'card'));