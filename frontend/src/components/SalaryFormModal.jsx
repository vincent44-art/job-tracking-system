import React from 'react';
import { Modal, Form, InputNumber, Select, Button } from 'antd';

const SalaryFormModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const { Option } = Select;

  return (
    <Modal
      title="Salary Adjustment"
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
          label="Amount"
          rules={[{ required: true, message: 'Please input amount!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `$ ${value}`}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SalaryFormModal;