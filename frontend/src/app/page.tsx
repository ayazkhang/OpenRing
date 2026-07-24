"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import {
  DeviceStatus,
  SensorType,
  useCreateSessionMutation,
  useGetDevicesQuery,
  useGetSessionReadingsQuery,
  useGetSessionsQuery,
  useIngestBatchMutation,
  useRegisterDeviceMutation,
} from "@/graphql/generated/graphql";

const ALL_SENSORS: SensorType[] = ["imu", "ppg", "temperature"];

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function HomePage() {
  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: devicesData, refetch: refetchDevices } = useGetDevicesQuery();
  const { data: sessionsData, refetch: refetchSessions } = useGetSessionsQuery();

  const devices = devicesData?.devices ?? [];
  const sessions = sessionsData?.sessions ?? [];

  const [registerDevice] = useRegisterDeviceMutation();
  const [createSession] = useCreateSessionMutation();
  const [ingestBatch] = useIngestBatchMutation();

  const [deviceForm, setDeviceForm] = useState({
    id: "ring-001",
    serialNumber: "SN-001",
    firmwareVersion: "1.0.0",
    hardwareRevision: "A1",
    supportedSensors: ["imu", "ppg", "temperature"] as SensorType[],
    status: "active" as DeviceStatus,
  });

  const [sessionForm, setSessionForm] = useState({
    studyId: "study-hrv",
    studyName: "HRV Pilot",
    anonymizedParticipantId: "p-anon-42",
    deviceId: "",
    enabledSensors: ["imu", "ppg"] as SensorType[],
  });

  const [syncForm, setSyncForm] = useState({
    batchId: `batch-${Date.now()}`,
    deviceId: "",
    sessionId: "",
    sensorType: "imu" as SensorType,
    payload: `{
  "timestamp": "2026-01-01T12:00:00Z",
  "values": { "x": 0.01, "y": 0.02, "z": 0.98 },
  "qualityFlag": "good"
}`,
  });

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const {
    data: readingsData,
    refetch: refetchReadings,
    loading: readingsLoading,
  } = useGetSessionReadingsQuery({
    variables: { sessionId: selectedSessionId },
    skip: !selectedSessionId,
  });

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  function clearAlerts() {
    setMessage(null);
    setError(null);
  }

  async function onRegisterDevice(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      await registerDevice({ variables: { input: deviceForm } });
      setMessage(`Device ${deviceForm.id} registered`);
      await refetchDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  async function onCreateSession(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      const deviceId = sessionForm.deviceId || devices[0]?.id;
      if (!deviceId) {
        setError("Register a device first");
        return;
      }
      const result = await createSession({
        variables: { input: { ...sessionForm, deviceId } },
      });
      const sessionId = result.data?.createSession.id;
      if (!sessionId) {
        setError("Session creation returned no id");
        return;
      }
      setMessage(`Session ${sessionId} created`);
      await refetchSessions();
      setSelectedSessionId(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session creation failed");
    }
  }

  async function onIngestBatch(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      const reading = JSON.parse(syncForm.payload);
      const deviceId = syncForm.deviceId || devices[0]?.id;
      const sessionId = syncForm.sessionId || sessions[0]?.id;
      if (!deviceId || !sessionId) {
        setError("Need a device and session before sync");
        return;
      }
      const result = await ingestBatch({
        variables: {
          input: {
            batchId: syncForm.batchId,
            deviceId,
            sessionId,
            sensorType: syncForm.sensorType,
            readings: [reading],
          },
        },
      });
      const batch = result.data?.ingestBatch;
      if (!batch) {
        setError("Ingest returned no batch");
        return;
      }
      setMessage(
        batch.duplicate
          ? `Duplicate batch ${batch.batchId} ignored (idempotent)`
          : `Ingested ${batch.readingCount} reading(s) for ${batch.batchId}`
      );
      setSyncForm((prev) => ({
        ...prev,
        batchId: `batch-${Date.now()}`,
      }));
      if (selectedSessionId === sessionId) {
        await refetchReadings();
      } else {
        setSelectedSessionId(sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    }
  }

  const apiBase =
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "") ||
    "http://localhost:4000";

  return (
    <Box minHeight="100vh">
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            OpenRing Research Console
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Wearable study sync
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
          Register rings, open study sessions, simulate mobile BLE sync batches,
          and export session readings. Backend: Express, GraphQL, TypeORM,
          PostgreSQL.
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Devices" />
            <Tab label="Sessions" />
            <Tab label="Sync batch" />
            <Tab label="Readings / Export" />
          </Tabs>
        </Paper>

        <TabPanel value={tab} index={0}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Paper sx={{ p: 3, flex: 1 }} component="form" onSubmit={onRegisterDevice}>
              <Typography variant="h6" gutterBottom>
                Register device
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Device ID"
                  value={deviceForm.id}
                  onChange={(e) =>
                    setDeviceForm({ ...deviceForm, id: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Serial number"
                  value={deviceForm.serialNumber}
                  onChange={(e) =>
                    setDeviceForm({ ...deviceForm, serialNumber: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Firmware version"
                  value={deviceForm.firmwareVersion}
                  onChange={(e) =>
                    setDeviceForm({
                      ...deviceForm,
                      firmwareVersion: e.target.value,
                    })
                  }
                  required
                />
                <TextField
                  label="Hardware revision"
                  value={deviceForm.hardwareRevision}
                  onChange={(e) =>
                    setDeviceForm({
                      ...deviceForm,
                      hardwareRevision: e.target.value,
                    })
                  }
                  required
                />
                <FormControl>
                  <InputLabel>Supported sensors</InputLabel>
                  <Select
                    multiple
                    value={deviceForm.supportedSensors}
                    input={<OutlinedInput label="Supported sensors" />}
                    renderValue={(selected) => selected.join(", ")}
                    onChange={(e) =>
                      setDeviceForm({
                        ...deviceForm,
                        supportedSensors: e.target.value as SensorType[],
                      })
                    }
                  >
                    {ALL_SENSORS.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Checkbox
                          checked={deviceForm.supportedSensors.includes(s)}
                        />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained">
                  Register
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, flex: 1.4, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>
                Registered devices
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Serial</TableCell>
                    <TableCell>FW</TableCell>
                    <TableCell>Sensors</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.id}</TableCell>
                      <TableCell>{d.serialNumber}</TableCell>
                      <TableCell>{d.firmwareVersion}</TableCell>
                      <TableCell>{d.supportedSensors.join(", ")}</TableCell>
                      <TableCell>{d.status}</TableCell>
                    </TableRow>
                  ))}
                  {devices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>No devices yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Paper sx={{ p: 3, flex: 1 }} component="form" onSubmit={onCreateSession}>
              <Typography variant="h6" gutterBottom>
                Create study session
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Study ID"
                  value={sessionForm.studyId}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, studyId: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Study name"
                  value={sessionForm.studyName}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, studyName: e.target.value })
                  }
                />
                <TextField
                  label="Anonymized participant ID"
                  value={sessionForm.anonymizedParticipantId}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      anonymizedParticipantId: e.target.value,
                    })
                  }
                  required
                />
                <FormControl>
                  <InputLabel>Device</InputLabel>
                  <Select
                    label="Device"
                    value={sessionForm.deviceId || devices[0]?.id || ""}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, deviceId: e.target.value })
                    }
                  >
                    {devices.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.id} ({d.serialNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Enabled sensors</InputLabel>
                  <Select
                    multiple
                    value={sessionForm.enabledSensors}
                    input={<OutlinedInput label="Enabled sensors" />}
                    renderValue={(selected) => selected.join(", ")}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        enabledSensors: e.target.value as SensorType[],
                      })
                    }
                  >
                    {ALL_SENSORS.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Checkbox
                          checked={sessionForm.enabledSensors.includes(s)}
                        />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained">
                  Create session
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, flex: 1.4, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>
                Sessions
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Session</TableCell>
                    <TableCell>Study</TableCell>
                    <TableCell>Participant</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Sensors</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell sx={{ maxWidth: 120, wordBreak: "break-all" }}>
                        {s.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>{s.studyId}</TableCell>
                      <TableCell>{s.anonymizedParticipantId}</TableCell>
                      <TableCell>{s.deviceId}</TableCell>
                      <TableCell>{s.enabledSensors.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>No sessions yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Paper sx={{ p: 3, maxWidth: 720 }} component="form" onSubmit={onIngestBatch}>
            <Typography variant="h6" gutterBottom>
              Simulate mobile sync batch
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Batch ID"
                value={syncForm.batchId}
                onChange={(e) =>
                  setSyncForm({ ...syncForm, batchId: e.target.value })
                }
                required
                helperText="Re-submit the same batch ID to verify idempotency"
              />
              <FormControl>
                <InputLabel>Device</InputLabel>
                <Select
                  label="Device"
                  value={syncForm.deviceId || devices[0]?.id || ""}
                  onChange={(e) =>
                    setSyncForm({ ...syncForm, deviceId: e.target.value })
                  }
                >
                  {devices.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Session</InputLabel>
                <Select
                  label="Session"
                  value={syncForm.sessionId || sessions[0]?.id || ""}
                  onChange={(e) =>
                    setSyncForm({ ...syncForm, sessionId: e.target.value })
                  }
                >
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.studyId} / {s.id.slice(0, 8)}…
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Sensor type</InputLabel>
                <Select
                  label="Sensor type"
                  value={syncForm.sensorType}
                  onChange={(e) =>
                    setSyncForm({
                      ...syncForm,
                      sensorType: e.target.value as SensorType,
                    })
                  }
                >
                  {ALL_SENSORS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Reading JSON"
                value={syncForm.payload}
                onChange={(e) =>
                  setSyncForm({ ...syncForm, payload: e.target.value })
                }
                multiline
                minRows={6}
                required
              />
              <Button type="submit" variant="contained">
                Ingest batch
              </Button>
            </Stack>
          </Paper>
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
              >
                <FormControl sx={{ minWidth: 280 }}>
                  <InputLabel>Session</InputLabel>
                  <Select
                    label="Session"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    {sessions.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.studyId} — {s.anonymizedParticipantId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedSessionId && (
                  <Button
                    variant="outlined"
                    href={`${apiBase}/sessions/${selectedSessionId}/export`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download CSV
                  </Button>
                )}
              </Stack>
              {selectedSession && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Enabled: {selectedSession.enabledSensors.join(", ")} · Device{" "}
                  {selectedSession.deviceId}
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>
                Readings {readingsLoading ? "(loading…)" : ""}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Sensor</TableCell>
                    <TableCell>Values</TableCell>
                    <TableCell>Quality</TableCell>
                    <TableCell>Batch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(readingsData?.sessionReadings ?? []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.timestamp}</TableCell>
                        <TableCell>{r.sensorType}</TableCell>
                        <TableCell>
                          <code>{JSON.stringify(r.values)}</code>
                        </TableCell>
                        <TableCell>{r.qualityFlag || "—"}</TableCell>
                        <TableCell>{r.batchId}</TableCell>
                      </TableRow>
                    ))}
                  {selectedSessionId &&
                    (readingsData?.sessionReadings?.length ?? 0) === 0 &&
                    !readingsLoading && (
                      <TableRow>
                        <TableCell colSpan={5}>No readings yet</TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </Paper>
          </Stack>
        </TabPanel>
      </Container>
    </Box>
  );
}
