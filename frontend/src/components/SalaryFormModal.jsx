import React from 'react';
import { Modal, Form, InputNumber, DatePicker, Select, Button, message } from 'antd';

const SalaryFormModal = ({ 
  visible, 
  onCancel, 
  onSubmit,
  initialValues = null,
  loading = false,
  employeeList = []
}) => {
  const [form] = Form.useForm();
  const { Option } = Select;

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          effectiveDate: initialValues.effectiveDate ? moment(initialValues.effectiveDate) : null
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      message.success(initialValues ? 'Salary updated successfully!' : 'Salary adjustment added!');
      if (!initialValues) {
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to submit salary adjustment');
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Salary Adjustment" : "New Salary Adjustment"}
      visible={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          {initialValues ? "Update" : "Submit"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="employee"
          label="Employee"
          rules={[{ required: true, message: 'Please select employee!' }]}
        >
          <Select 
            placeholder="Select employee"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {employeeList.map(emp => (
              <Option key={emp.id} value={emp.id}>
                {emp.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Salary Amount"
          rules={[
            { required: true, message: 'Please input the amount!' },
            { 
              type: 'number', 
              min: 1, 
              message: 'Salary must be at least $1!' 
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="effectiveDate"
          label="Effective Date"
          rules={[{ required: true, message: 'Please select date!' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            disabledDate={current => current && current < moment().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Adjustment Notes"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Reason for adjustment..." 
            maxLength={500} 
            showCount 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SalaryFormModal;