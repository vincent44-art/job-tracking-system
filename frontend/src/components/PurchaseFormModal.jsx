import React from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';

const PurchaseFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Add Purchase"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={() => {
            form.validateFields()
              .then(values => {
                onSubmit(values);
                form.resetFields();
              })
          }}
        >
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="item"
          label="Item Name"
          rules={[{ required: true, message: 'Please input item name!' }]}
        >
          <Input placeholder="Enter item name" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please input amount!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            formatter={value => `$ ${value}`}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PurchaseFormModal;