import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { gradesApi, groupsApi, usersApi } from '../../lib/api';

interface GradeFormProps {
  grade?: any;
  onSuccess: () => void;
}

export default function GradeForm({ grade, onSuccess }: GradeFormProps) {
  const [formData, setFormData] = useState({
    studentId: grade?.studentId?._id || grade?.studentId || '',
    groupId: grade?.groupId?._id || grade?.groupId || '',
    subject: grade?.subject || '',
    grade: grade?.grade || '',
    maxGrade: grade?.maxGrade || 100,
    date: grade?.date ? new Date(grade.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    gradeType: grade?.gradeType || 'homework',
    lessonTopic: grade?.lessonTopic || '',
    comment: grade?.comment || '',
    weight: grade?.weight || 1,
  });

  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => usersApi.getStudents().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: grade 
      ? (data: any) => gradesApi.update(grade._id, data)
      : gradesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Convert numbers
    submitData.grade = Number(submitData.grade);
    submitData.maxGrade = Number(submitData.maxGrade);
    submitData.weight = Number(submitData.weight);

    mutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter students based on selected group
  const filteredStudents = students?.filter((student: any) => {
    if (!formData.groupId) return true;
    const selectedGroup = groups?.find((g: any) => g._id === formData.groupId);
    return selectedGroup?.studentIds?.some((s: any) => s._id === student._id);
  }) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guruh</label>
          <select
            name="groupId"
            required
            className="input mt-1"
            value={formData.groupId}
            onChange={handleChange}
          >
            <option value="">Guruhni tanlang</option>
            {groups?.map((group: any) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">O'quvchi</label>
          <select
            name="studentId"
            required
            className="input mt-1"
            value={formData.studentId}
            onChange={handleChange}
          >
            <option value="">O'quvchini tanlang</option>
            {filteredStudents.map((student: any) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fan</label>
          <input
            type="text"
            name="subject"
            required
            className="input mt-1"
            placeholder="Masalan: Grammar"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Baho turi</label>
          <select
            name="gradeType"
            className="input mt-1"
            value={formData.gradeType}
            onChange={handleChange}
          >
            <option value="homework">Uy vazifasi</option>
            <option value="quiz">Test</option>
            <option value="exam">Imtihon</option>
            <option value="project">Loyiha</option>
            <option value="participation">Faollik</option>
            <option value="other">Boshqa</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Baho</label>
          <input
            type="number"
            name="grade"
            min="0"
            required
            className="input mt-1"
            placeholder="85"
            value={formData.grade}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maksimal baho</label>
          <input
            type="number"
            name="maxGrade"
            min="1"
            required
            className="input mt-1"
            value={formData.maxGrade}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Og'irligi</label>
          <input
            type="number"
            name="weight"
            min="0.1"
            step="0.1"
            className="input mt-1"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sana</label>
          <input
            type="date"
            name="date"
            required
            className="input mt-1"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dars mavzusi</label>
          <input
            type="text"
            name="lessonTopic"
            className="input mt-1"
            placeholder="Masalan: Present Perfect Tense"
            value={formData.lessonTopic}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Izoh</label>
        <textarea
          name="comment"
          rows={3}
          className="input mt-1"
          placeholder="O'qituvchi izohi"
          value={formData.comment}
          onChange={handleChange}
        />
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