// PaymentFormModal.jsx
import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";

const PaymentFormModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        form.resetFields();
        onSubmit(values);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Add Salary Payment"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Submit"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="employee"
          label="Employee Name"
          rules={[{ required: true, message: "Please enter employee name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter the amount" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          name="date"
          label="Payment Date"
          rules={[{ required: true, message: "Please select the date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentFormModal;
