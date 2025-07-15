import React from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';

const PurchaseFormModal = ({ 
  visible, 
  onCancel, 
  onSubmit,
  initialValues = null,
  loading = false
}) => {
  const [form] = Form.useForm();

  // Reset form fields when modal is opened/closed or initialValues change
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      if (!initialValues) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Purchase" : "Add New Purchase"}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
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
          name="item"
          label="Item Name"
          rules={[
            { 
              required: true, 
              message: 'Please input the item name!' 
            },
            {
              max: 100,
              message: 'Item name cannot exceed 100 characters!'
            }
          ]}
        >
          <Input 
            placeholder="What was purchased?" 
            allowClear 
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { 
              required: true, 
              message: 'Please input the amount!' 
            },
            {
              type: 'number',
              min: 0.01,
              message: 'Amount must be greater than 0!'
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            placeholder="0.00"
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item 
          name="notes" 
          label="Notes"
          rules={[
            {
              max: 500,
              message: 'Notes cannot exceed 500 characters!'
            }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Additional details..." 
            showCount 
            maxLength={500} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PurchaseFormModal;