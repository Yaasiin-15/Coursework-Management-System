'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'assignment' | 'grade' | 'reminder' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  assignmentId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications')
    if (saved) {
      setNotifications(JSON.parse(saved))
    }
    
    // Check for due date reminders
    checkDueDateReminders()
  }, [])

  const checkDueDateReminders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/assignments/due-soon', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const { assignments } = await response.json()
        assignments.forEach((assignment: any) => {
          addNotification({
            type: 'reminder',
            title: 'Assignment Due Soon',
            message: `${assignment.title} is due in ${assignment.daysUntilDue} day(s)`,
            assignmentId: assignment._id
          })
        })
      }
    } catch (error) {
      console.error('Error checking due dates:', error)
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    }
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}