import React from 'react';
import { Modal, Form, FloatingLabel } from 'react-bootstrap';

const SalaryFormModal = ({ show, handleClose, handleSubmit, user }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="bg-purple text-white">
        <Modal.Title>{user ? 'Edit Salary' : 'Add Salary'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="employeeName" label="Employee Name" className="mb-3">
            <Form.Control 
              type="text" 
              placeholder="Employee Name" 
              defaultValue={user?.name || ''}
              required 
            />
          </FloatingLabel>
          
          <FloatingLabel controlId="salaryAmount" label="Salary Amount (KES)" className="mb-3">
            <Form.Control 
              type="number" 
              placeholder="Salary in KES" 
              defaultValue={user?.salary || ''}
              required 
            />
          </FloatingLabel>
          
          <Form.Check 
            type="checkbox"
            id="isPaid"
            label="Mark as paid"
            defaultChecked={user?.isPaid || false}
            className="mb-3"
          />
          
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-purple">
              {user ? 'Update' : 'Add'} Salary
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SalaryFormModal;