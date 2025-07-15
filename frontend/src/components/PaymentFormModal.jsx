import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button } from 'antd'; // Added Button to imports

const PaymentFormModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const { Option } = Select;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Record Payment"
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Record Payment
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="employee"
          label="Employee"
          rules={[{ required: true, message: 'Please select employee!' }]}
        >
          <Select placeholder="Select employee">
            <Option value="john">John Doe</Option>
            <Option value="jane">Jane Smith</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="amount"
          label="Payment Amount"
          rules={[{ required: true, message: 'Please input the amount!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>
        <Form.Item
          name="date"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label="Payment Method">
          <Select placeholder="Select method">
            <Option value="bank">Bank Transfer</Option>
            <Option value="cash">Cash</Option>
            <Option value="check">Check</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentFormModal;