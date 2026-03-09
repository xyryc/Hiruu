import { StatusBadgeProps } from "@/types";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const StatusBadge = ({
  label,
  status,
  size = "medium",
  className = "",
}: StatusBadgeProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case "upcoming":
        return {
          containerClasses: "bg-yellow-50 border-[#EAC3244D]",
          textClasses: "text-[#EAC324]",
          dotClasses: "bg-[#EAC324]",
          label: label || "Upcoming",
        };
      case "completed":
        return {
          containerClasses: "bg-[#EAFFEF] border-[#3EBF5A4D]",
          textClasses: "text-[#3EBF5A]",
          dotClasses: "bg-[#3EBF5A]",
          label: "Completed",
        };
      case "submitted":
        return {
          containerClasses: "bg-[#EAFFEF] border-[#3EBF5A4D]",
          textClasses: "text-[#3EBF5A]",
          dotClasses: "bg-[#3EBF5A]",
          label: "Submitted",
        };
      case "missed":
        return {
          containerClasses: "bg-red-100 border-[#F34F4F4D]",
          textClasses: "text-red-600",
          dotClasses: "bg-red-600",
          label: "Missed",
        };
      case "ongoing":
        return {
          containerClasses: "bg-orange-100 border-[#F3934F4D]",
          textClasses: "text-orange-600",
          dotClasses: "bg-orange-600",
          label: "Ongoing",
        };
      case "pending":
        return {
          containerClasses: "bg-orange-100 border-[#F3934F4D]",
          textClasses: "text-orange-600",
          dotClasses: "bg-orange-600",
          label: label || "Pending",
        };
      case "approved":
        return {
          containerClasses: "bg-[#ECF9EF] border-[#F3934F4D]",
          textClasses: "text-[#3EBF5A]",
          dotClasses: "bg-[#3EBF5A]",
          label: "Approved",
        };
      case "accepted":
        return {
          containerClasses: "bg-[#ECF9EF] border-[#F3934F4D]",
          textClasses: "text-[#3EBF5A]",
          dotClasses: "bg-[#3EBF5A]",
          label: label || "Accepted",
        };
      case "rejected":
        return {
          containerClasses: "bg-[#FEEEEE] border-[#F3934F4D]",
          textClasses: "text-[#F34F4F]",
          dotClasses: "bg-[#F34F4F]",
          label: "Rejected",
        };

      case "available":
        return {
          containerClasses: "bg-[#EAFFEF] border-[#3EBF5A4D]",
          textClasses: "text-[#3EBF5A]",
          dotClasses: "bg-[#3EBF5A]",
          label: "Available",
        };
      case "unavailable":
        return {
          containerClasses: "bg-gray-100 border-gray-300",
          textClasses: "text-gray-600",
          dotClasses: "bg-gray-600",
          label: "Offline",
        };
      default:
        return {
          containerClasses: "bg-gray-100",
          textClasses: "text-gray-600",
          dotClasses: "bg-gray-600",
          label: "Unknown",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          containerClasses: "px-2 py-1 rounded-xl",
          textClasses: "text-xs",
          dotClasses: "w-1.5 h-1.5",
        };
      case "large":
        return {
          containerClasses: "px-4 py-2 rounded-2xl",
          textClasses: "text-base",
          dotClasses: "w-2 h-2",
        };
      default: // medium
        return {
          containerClasses: "px-3 py-1.5 rounded-2xl",
          textClasses: "text-sm",
          dotClasses: "w-1.5 h-1.5",
        };
    }
  };

  const statusConfig = getStatusClasses();
  const sizeConfig = getSizeClasses();

  return (
    <TouchableOpacity
      className={`flex-row items-center border-hairline rounded-full ${statusConfig.containerClasses} ${sizeConfig.containerClasses} ${className}`}
    >
      {/* Status Dot */}
      <View
        className={`${statusConfig.dotClasses} ${sizeConfig.dotClasses} rounded-full mr-1.5`}
      />
      {/* Status Text */}
      <Text className={`${statusConfig.textClasses} ${sizeConfig.textClasses}`}>
        {statusConfig.label}
      </Text>
    </TouchableOpacity>
  );
};

export default StatusBadge;
