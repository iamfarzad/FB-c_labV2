-- Add estimated_cost column to token_usage_logs as a regular column
ALTER TABLE token_usage_logs 
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 6);

-- Update existing rows to calculate the estimated cost
UPDATE token_usage_logs 
SET estimated_cost = COALESCE(input_cost, 0) + COALESCE(output_cost, 0)
WHERE estimated_cost IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN token_usage_logs.estimated_cost IS 'Total estimated cost calculated as input_cost + output_cost.';

-- Create a function to update estimated_cost
CREATE OR REPLACE FUNCTION update_estimated_cost()
RETURNS TRIGGER AS $$
BEGIN
    NEW.estimated_cost = COALESCE(NEW.input_cost, 0) + COALESCE(NEW.output_cost, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update estimated_cost on INSERT and UPDATE
CREATE OR REPLACE TRIGGER update_token_usage_logs_estimated_cost
BEFORE INSERT OR UPDATE OF input_cost, output_cost ON token_usage_logs
FOR EACH ROW 
EXECUTE FUNCTION update_estimated_cost();

-- Add a comment to document the trigger
COMMENT ON TRIGGER update_token_usage_logs_estimated_cost ON token_usage_logs IS 
'Automatically updates estimated_cost whenever input_cost or output_cost changes.';
