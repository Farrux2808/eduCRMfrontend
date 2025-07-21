import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../lib/api';

interface CourseFormProps {
  course?: any;
  onSuccess: () => void;
}

export default function CourseForm({ course, onSuccess }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    category: course?.category || '',
    level: course?.level || 'beginner',
    duration: course?.duration || '',
    price: course?.price || '',
    maxStudents: course?.maxStudents || '',
    isActive: course?.isActive ?? true,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: course 
      ? (data: any) => coursesApi.update(course._id, data)
      : coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Convert numbers
    if (submitData.duration) {
      submitData.duration = Number(submitData.duration);
    }
    if (submitData.price) {
      submitData.price = Number(submitData.price);
    }
    if (submitData.maxStudents) {
      submitData.maxStudents = Number(submitData.maxStudents);
    }

    mutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Kurs nomi</label>
        <input
          type="text"
          name="name"
          required
          className="input mt-1"
          placeholder="Masalan: English Language Course"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tavsif</label>
        <textarea
          name="description"
          rows={3}
          className="input mt-1"
          placeholder="Kurs haqida batafsil ma'lumot"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kategoriya</label>
          <input
            type="text"
            name="category"
            className="input mt-1"
            placeholder="Masalan: Til o'rganish"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Daraja</label>
          <select
            name="level"
            className="input mt-1"
            value={formData.level}
            onChange={handleChange}
          >
            <option value="beginner">Boshlang'ich</option>
            <option value="intermediate">O'rta</option>
            <option value="advanced">Yuqori</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Davomiyligi (oy)</label>
          <input
            type="number"
            name="duration"
            min="1"
            required
            className="input mt-1"
            placeholder="6"
            value={formData.duration}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Narx (so'm)</label>
          <input
            type="number"
            name="price"
            min="0"
            required
            className="input mt-1"
            placeholder="500000"
            value={formData.price}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Maksimal o'quvchilar soni</label>
        <input
          type="number"
          name="maxStudents"
          min="1"
          className="input mt-1"
          placeholder="15"
          value={formData.maxStudents}
          onChange={handleChange}
        />
      </div>

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