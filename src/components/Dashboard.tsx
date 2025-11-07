import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Header } from "./Header";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const Dashboard = () => {
  const { token, user } = useAuth();
  const [targetEmail, setTargetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadConnectedUsers();
  }, []);

  const loadConnectedUsers = async () => {
    if (!token) return;
    try {
      const response = await api.getConnectedUsers(token);
      setConnectedUsers(response.connectedUsers);
    } catch (err) {
      console.error("Failed to load connected users:", err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!token) throw new Error("Not authenticated");

      await api.sendNotification(token, targetEmail, message, type);
      setSuccess("Notification sent successfully!");
      setMessage("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send notification"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Header />
    </Box>
  );
};
