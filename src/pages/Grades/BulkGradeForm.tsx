import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { gradesApi, groupsApi } from '../../lib/api';

interface BulkGradeFormProps {
  onSuccess: () => void;
}

export default function BulkGradeForm({ onSuccess }: BulkGradeFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [commonData, setCommonData] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0],
    gradeType: 'homework',
    lessonTopic: '',
    maxGrade: 100,
  });
  const [studentGrades, setStudentGrades] = useState<Record<string, any>>({});

  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll().then(res => res.data),
  });

  const selectedGroup = groups?.find((g: any) => g._id === selectedGroupId);

  const mutation = useMutation({
    mutationFn: gradesApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      onSuccess();
    },
  });

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setStudentGrades({});
  };

  const handleCommonDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCommonData(prev => ({
      ...prev,
      [name]: name === 'maxGrade' ? Number(value) : value,
    }));
  };

  const handleStudentGradeChange = (studentId: string, field: string, value: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === 'grade' || field === 'weight' ? Number(value) : value,
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) return;

    const gradesData = selectedGroup.studentIds
      .filter((student: any) => studentGrades[student._id]?.grade !== undefined && studentGrades[student._id]?.grade !== '')
      .map((student: any) => ({
        studentId: student._id,
        groupId: selectedGroupId,
        subject: commonData.subject,
        date: commonData.date,
        gradeType: commonData.gradeType,
        lessonTopic: commonData.lessonTopic,
        maxGrade: commonData.maxGrade,
        grade: studentGrades[student._id]?.grade || 0,
        comment: studentGrades[student._id]?.comment || '',
        weight: studentGrades[student._id]?.weight || 1,
      }));

    if (gradesData.length === 0) {
      alert('Hech bo\'lmaganda bitta o\'quvchiga baho bering!');
      return;
    }

    mutation.mutate(gradesData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guruh</label>
          <select
            required
            className="input mt-1"
            value={selectedGroupId}
            onChange={(e) => handleGroupChange(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700">Fan</label>
          <input
            type="text"
            name="subject"
            required
            className="input mt-1"
            placeholder="Masalan: Grammar"
            value={commonData.subject}
            onChange={handleCommonDataChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sana</label>
          <input
            type="date"
            name="date"
            required
            className="input mt-1"
            value={commonData.date}
            onChange={handleCommonDataChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Baho turi</label>
          <select
            name="gradeType"
            className="input mt-1"
            value={commonData.gradeType}
            onChange={handleCommonDataChange}
          >
            <option value="homework">Uy vazifasi</option>
            <option value="quiz">Test</option>
            <option value="exam">Imtihon</option>
            <option value="project">Loyiha</option>
            <option value="participation">Faollik</option>
            <option value="other">Boshqa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maksimal baho</label>
          <input
            type="number"
            name="maxGrade"
            min="1"
            required
            className="input mt-1"
            value={commonData.maxGrade}
            onChange={handleCommonDataChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dars mavzusi</label>
        <input
          type="text"
          name="lessonTopic"
          className="input mt-1"
          placeholder="Masalan: Present Perfect Tense"
          value={commonData.lessonTopic}
          onChange={handleCommonDataChange}
        />
      </div>

      {selectedGroup && selectedGroup.studentIds && selectedGroup.studentIds.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">O'quvchilar baholari</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedGroup.studentIds.map((student: any) => (
              <div key={student._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Baho</label>
                    <input
                      type="number"
                      min="0"
                      max={commonData.maxGrade}
                      className="input text-sm"
                      placeholder="0"
                      value={studentGrades[student._id]?.grade || ''}
                      onChange={(e) => handleStudentGradeChange(student._id, 'grade', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Og'irligi</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="input text-sm"
                      placeholder="1"
                      value={studentGrades[student._id]?.weight || ''}
                      onChange={(e) => handleStudentGradeChange(student._id, 'weight', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Izoh</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Izoh"
                      value={studentGrades[student._id]?.comment || ''}
                      onChange={(e) => handleStudentGradeChange(student._id, 'comment', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          disabled={mutation.isPending || !selectedGroup}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saqlanmoqda...' : 'Baholarni saqlash'}
        </button>
      </div>
    </form>
  );
}