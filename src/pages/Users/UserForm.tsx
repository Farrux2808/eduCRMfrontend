import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../lib/api';

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    phone: user?.phone || '',
    address: user?.address || '',
    isActive: user?.isActive ?? true,
    salary: user?.salary || '',
    paymentMethod: user?.paymentMethod || 'student_based',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: user 
      ? (data: any) => usersApi.update(user._id, data)
      : usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Remove password if empty for updates
    if (user && !submitData.password) {
      delete submitData.password;
    }
    
    // Convert salary to number
    if (submitData.salary) {
      submitData.salary = Number(submitData.salary);
    }

    mutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ism</label>
          <input
            type="text"
            name="firstName"
            required
            className="input mt-1"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Familiya</label>
          <input
            type="text"
            name="lastName"
            required
            className="input mt-1"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          required
          className="input mt-1"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Parol {user && '(bo\'sh qoldiring o\'zgartirmaslik uchun)'}
        </label>
        <input
          type="password"
          name="password"
          required={!user}
          className="input mt-1"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            name="role"
            required
            className="input mt-1"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">O'quvchi</option>
            <option value="teacher">O'qituvchi</option>
            <option value="parent">Ota-ona</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Telefon</label>
          <input
            type="tel"
            name="phone"
            className="input mt-1"
            placeholder="+998901234567"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Manzil</label>
        <input
          type="text"
          name="address"
          className="input mt-1"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {formData.role === 'teacher' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Maosh</label>
            <input
              type="number"
              name="salary"
              className="input mt-1"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To'lov usuli</label>
            <select
              name="paymentMethod"
              className="input mt-1"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="student_based">O'quvchi to'loviga asoslangan</option>
              <option value="fixed_salary">Qat'iy maosh</option>
              <option value="group_based">Guruh soniga asoslangan</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Faol
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onSuccess}
          className="btn-secondary"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  );
}