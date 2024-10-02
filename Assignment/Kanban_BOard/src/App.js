

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const priorityLabels = {
    0: 'No Priority',
    1: 'Urgent',
    2: 'High Priority',
    3: 'Medium Priority',
    4: 'Low Priority',
  };

  const priorityIcons = {
    0: `${process.env.PUBLIC_URL}/icons_FEtask/No-priority.svg`,
    1: `${process.env.PUBLIC_URL}/icons_FEtask/SVG - Urgent Priority colour.svg`,
    2: `${process.env.PUBLIC_URL}/icons_FEtask/Img - High Priority.svg`,
    3: `${process.env.PUBLIC_URL}/icons_FEtask/Img - Medium Priority.svg`,
    4: `${process.env.PUBLIC_URL}/icons_FEtask/Img - Low Priority.svg`,
  };

  const statusLabels = {
    'todo': 'To-Do',
    'in-progress': 'In Progress',
    'backlog': 'Backlog',
    'done': 'Done',
    'cancelled': 'Cancelled',
  };

  const statusIcons = {
    'todo': `${process.env.PUBLIC_URL}/icons_FEtask/To-do.svg`,
    'in-progress': `${process.env.PUBLIC_URL}/icons_FEtask/in-progress.svg`,
    'backlog': `${process.env.PUBLIC_URL}/icons_FEtask/Backlog.svg`,
    'done': `${process.env.PUBLIC_URL}/icons_FEtask/Done.svg`,
    'cancelled': `${process.env.PUBLIC_URL}/icons_FEtask/Cancelled.svg`,
  };

  const allStatuses = ['todo', 'in-progress', 'backlog', 'done', 'cancelled'];

  const normalizeStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'todo';
      case 'in progress':
        return 'in-progress';
      case 'backlog':
        return 'backlog';
      case 'done':
        return 'done';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'backlog';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        const normalizedTickets = response.data.tickets.map(ticket => ({
          ...ticket,
          status: normalizeStatus(ticket.status)
        }));
        setTickets(normalizedTickets);
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  const getGroupedTickets = () => {
    if (grouping === 'priority') {
      return tickets.reduce((acc, ticket) => {
        acc[ticket.priority] = acc[ticket.priority] || [];
        acc[ticket.priority].push(ticket);
        return acc;
      }, {});
    } else if (grouping === 'status') {
      const statuses = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = acc[ticket.status] || [];
        acc[ticket.status].push(ticket);
        return acc;
      }, {});

      allStatuses.forEach((status) => {
        statuses[status] = statuses[status] || [];
      });
      return statuses;
    } else if (grouping === 'user') {
      return tickets.reduce((acc, ticket) => {
        acc[ticket.userId] = acc[ticket.userId] || [];
        acc[ticket.userId].push(ticket);
        return acc;
      }, {});
    }
  };

  const getSortedTickets = (ticketsToSort) => {
    if (sorting === 'priority') {
      return [...ticketsToSort].sort((a, b) => b.priority - a.priority);
    } else if (sorting === 'title') {
      return [...ticketsToSort].sort((a, b) => a.title.localeCompare(b.title));
    }
    return ticketsToSort;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const groupedTickets = getGroupedTickets();

  return (
    <div className="kanban-board">
      <div className="navbar">
        <div className="nav-left">
          <button className="display-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
            <img src={`${process.env.PUBLIC_URL}/icons_FEtask/Display.svg`} alt="Display" /> Display
          </button>
          {isDropdownOpen && (
            <div className="dropdown">
              <label>
                Grouping:
                <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="user">User</option>
                </select>
              </label>
              <label>
                Ordering:
                <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </label>
            </div>
          )}
        </div>
        <div className="nav-right">
          <img src={`${process.env.PUBLIC_URL}/icons_FEtask/add.svg`} alt="Add" />
        </div>
      </div>

      <div className="kanban-container">
        {Object.entries(groupedTickets).map(([group, ticketsInGroup]) => (
          <div key={group} className="kanban-column">
            <h2>
              {grouping === 'status' && statusIcons[group] && (
                <img src={statusIcons[group]} alt={statusLabels[group]} className="status-icon" />
              )}
              {grouping === 'priority' && priorityIcons[group] && (
                <img src={priorityIcons[group]} alt={priorityLabels[group]} className="priority-icon" />
              )}
              {grouping === 'user' ? getUserName(group) : (statusLabels[group] || priorityLabels[group] || group)} ({ticketsInGroup.length})
            </h2>
            {getSortedTickets(ticketsInGroup).map((ticket) => (
              <div key={ticket.id} className="kanban-card">
                <div className="kanban-card-header">
                  <span className="ticket-id">{ticket.id}</span>
                  {(grouping === 'priority' || grouping === 'user') && statusIcons[ticket.status] && (
                    <img src={statusIcons[ticket.status]} alt={statusLabels[ticket.status]} className="status-icon" />
                  )}
                </div>
                <h3 className="ticket-title">{ticket.title}</h3>
                <div className="ticket-tag">
                  {(grouping === 'status' || grouping === 'user') && priorityIcons[ticket.priority] && (
                    <img src={priorityIcons[ticket.priority]} alt={priorityLabels[ticket.priority]} className="priority-icon" />
                  )}
                  <span>{ticket.tag[0]}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

