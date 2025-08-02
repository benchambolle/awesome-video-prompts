"use client"

import React from "react"
import { cn } from "@workspace/ui/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/ui/table";
import { Badge } from "@workspace/ui/components/ui/badge";
import { Button } from "@workspace/ui/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/ui/avatar";

// Status Badge Component inspired by the images
interface StatusBadgeProps {
  status: "success" | "in-progress" | "error" | "pending"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    success: {
      color: "bg-emerald-500/90 text-white border-emerald-400/50",
      dot: "bg-emerald-200",
      label: "Success"
    },
    "in-progress": {
      color: "bg-blue-500/90 text-white border-blue-400/50",
      dot: "bg-blue-200",
      label: "In Progress"
    },
    error: {
      color: "bg-red-500/90 text-white border-red-400/50",
      dot: "bg-red-200",
      label: "Error"
    },
    pending: {
      color: "bg-orange-500/90 text-white border-orange-400/50",
      dot: "bg-orange-200",
      label: "Pending"
    }
  }

  const config = statusConfig[status]
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm shadow-none (for-testing) border",
      config.color,
      className
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </div>
  )
}

// Progress Bar Component for Tables
interface TableProgressBarProps {
  progress: number // 0-100
  className?: string
}

export function TableProgressBar({ progress, className }: TableProgressBarProps) {
  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium min-w-[3rem]">
        {progress}%
      </span>
    </div>
  )
}

// Modern Task Management Table
interface TaskData {
  id: string
  name: string
  assignee: {
    name: string
    avatar?: string
    initials: string
  }
  status: "success" | "in-progress" | "error" | "pending"
  progress: number
  dueDate: string
}

interface ModernTableProps {
  title: string
  data: TaskData[]
  className?: string
}

export function ModernTable({ title, data, className }: ModernTableProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow-none (for-testing) hover:shadow-blue-500/25"
          >
            + New Task
          </Button>
        </div>
      </div>

      {/* Modern Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input type="checkbox" className="rounded-mdborder-gray-600 bg-gray-800" />
            </TableHead>
            <TableHead>Task Name</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <input type="checkbox" className="rounded-mdborder-gray-600 bg-gray-800" />
              </TableCell>
              <TableCell className="font-medium text-white max-w-xs">
                <div className="truncate">{task.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                      {task.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300">{task.assignee.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell className="w-32">
                <TableProgressBar progress={task.progress} />
              </TableCell>
              <TableCell className="text-gray-300 text-sm">
                {task.dueDate}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white hover:bg-gray-700 px-2 py-1"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white hover:bg-gray-700 px-2 py-1"
                  >
                    •••
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          1 to 10 of 1000 items
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Previous
          </Button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              className={cn(
                "w-8 h-8 p-0 text-sm",
                page === 1 
                  ? "bg-blue-600 text-white hover:bg-blue-500" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              {page}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Example usage data
export const sampleTaskData: TaskData[] = [
  {
    id: "1",
    name: "CodeCraft: A Journey Through Software Development",
    assignee: { name: "Alex Johnson", initials: "AJ" },
    status: "success",
    progress: 66,
    dueDate: "2024-05-14 10:30:00"
  },
  {
    id: "2", 
    name: "Debugging Adventures: Finding Bugs in Code",
    assignee: { name: "Maria Garcia", initials: "MG" },
    status: "in-progress",
    progress: 33,
    dueDate: "2024-11-22 14:45:00"
  },
  {
    id: "3",
    name: "Feature Forge: Building New Software Capabilities", 
    assignee: { name: "Liam Smith", initials: "LS" },
    status: "success",
    progress: 100,
    dueDate: "2024-04-09 09:15:00"
  },
  {
    id: "4",
    name: "Sprint Sprint: Agile Development in Action",
    assignee: { name: "Sophia Brown", initials: "SB" },
    status: "in-progress", 
    progress: 28,
    dueDate: "2024-06-30 18:00:00"
  },
  {
    id: "5",
    name: "Version Control Voyage: Navigating Git and Beyond",
    assignee: { name: "Ethan Davis", initials: "ED" },
    status: "success",
    progress: 100,
    dueDate: "2024-01-15 07:00:00"
  }
]
