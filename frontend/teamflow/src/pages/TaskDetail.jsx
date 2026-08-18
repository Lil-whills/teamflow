import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskDetailDrawer from '../components/TaskDetailDrawer';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <TaskDetailDrawer
      taskId={id}
      onClose={() => navigate(-1)}
    />
  );
};

export default TaskDetail;