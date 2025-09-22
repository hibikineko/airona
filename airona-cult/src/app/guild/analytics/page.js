"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import { DateTime } from "luxon";

const CLASS_ABBR = {
  "Marksman": "MM",
  "Stormblade": "SB",
  "Verdant Oracle": "VO",
  "Shield Knight": "SK",
  "Wind Knight": "WK",
  "Beat Performer": "BP",
  "Heavy Guardian": "HG",
  "Frost Mage": "FM",
};

const CLASS_COLORS = {
  MM: "#FFA726",
  SB: "#AB47BC",
  VO: "#26A69A",
  SK: "#42A5F5",
  WK: "#8D6E63",
  BP: "#FF7043",
  HG: "#6D4C41",
  FM: "#66BB6A",
  OTHER: "#B0BEC5",
};

const AGE_COLORS = {
  "13-20": "#A6D86C",
  "21-30": "#C7B7F9",
  "30+": "#A0A0A0",
  UNKNOWN: "#D3D3D3",
};

const PLAYSTYLE_COLORS = {
  casual: "#66BB6A",
  semi: "#A6D86C",
  comp: "#5C8138",
  unknown: "#BDBDBD",
};

export default function GuildAnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch("/api/approved");
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        setData(result || []);
      } catch (err) {
        console.error("Failed to load approved data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApproved();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // ---------- Helpers ----------
  const safeString = (v) => (v === null || v === undefined ? "Unknown" : String(v));

  // Parse timezone offset in hours (can be negative, fractional). Accepts IANA zone names or UTC offsets.
  const tzToOffsetHours = (tz) => {
    if (!tz) return 0;
    try {
      // If tz is like "UTC+2" or "GMT+8", try to parse numeric offset quickly
      const m = tz.match(/([UuGg][Tt][Cc]?|GMT)?\s*([+-]\d{1,2})(:?(\d{2}))?/);
      if (m && (m[2] || m[3])) {
        const h = parseInt(m[2], 10);
        const mins = m[4] ? parseInt(m[4], 10) : 0;
        return h + mins / 60;
      }
      // Otherwise use luxon to get offset minutes
      const dt = DateTime.now().setZone(tz);
      if (dt.isValid) return dt.offset / 60;
    } catch (e) {
      // fallback
    }
    return 0;
  };

  // Build classes distribution
  const classesCount = data.reduce((acc, cur) => {
    const cls = safeString(cur.planned_main_class);
    const abbr = CLASS_ABBR[cls] || (cls ? cls.slice(0,2).toUpperCase() : "OT");
    acc[abbr] = (acc[abbr] || 0) + 1;
    return acc;
  }, {});
  const classesData = Object.entries(classesCount).map(([name, value]) => ({
    name,
    value,
    color: CLASS_COLORS[name] || CLASS_COLORS.OTHER,
  })).sort((a,b) => b.value - a.value);

  // Age distribution
  const ageCount = data.reduce((acc, cur) => {
    const a = cur.age_range || "UNKNOWN";
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});
  const ageData = Object.entries(ageCount).map(([name, value]) => ({
    name,
    value,
    color: AGE_COLORS[name] || AGE_COLORS.UNKNOWN,
  }));

  // Playstyle (pie)
  const playstyleCount = data.reduce((acc, cur) => {
    const p = (cur.playstyle || "unknown").toLowerCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const playstyleData = Object.entries(playstyleCount).map(([name, value]) => ({
    name,
    value,
    color: PLAYSTYLE_COLORS[name] || PLAYSTYLE_COLORS.unknown,
  }));

  // Favorite activities (anonymous) - aggregated and sorted
  const favCount = data.reduce((acc, cur) => {
    const activity = (cur.favourite_bpsr_activity || "Unknown").trim();
    if (!activity) return acc;
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {});
  const favData = Object.entries(favCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a,b) => b.count - a.count);

  // Timezone distribution by UTC offset (rounded to nearest integer)
  const tzMap = data.reduce((acc, cur) => {
    const tz = cur.timezone;
    const off = Math.round(tzToOffsetHours(tz)); // round to nearest hour for grouping
    acc[off] = (acc[off] || 0) + 1;
    return acc;
  }, {});

  // Convert into array and create tick marks every 5 hours
  const tzEntries = Object.entries(tzMap)
    .map(([k, v]) => ({ offset: parseInt(k, 10), value: v }))
    .sort((a,b) => a.offset - b.offset);

  // Determine tick range in multiples of 5
  const minOffset = tzEntries.length ? tzEntries[0].offset : -12;
  const maxOffset = tzEntries.length ? tzEntries[tzEntries.length-1].offset : 12;
  const tickStart = Math.floor(minOffset / 5) * 5;
  const tickEnd = Math.ceil(maxOffset / 5) * 5;
  const tzTicks = [];
  for (let t = tickStart; t <= tickEnd; t += 5) tzTicks.push(t);

  const timezoneData = tzEntries.map(e => ({ name: `UTC${e.offset>=0?"+":""}${e.offset}`, value: e.value, offset: e.offset }));

  // Active time aggregation - expects active_time_utc as array of {start: "HH:mm", end: "HH:mm"} in UTC
  // If your api stores active_time as a string like "8pm to 12am", you should pre-convert on server into active_time_utc.
  const hourBins = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  data.forEach(member => {
    const ranges = member.active_time_utc;
    if (!ranges || !Array.isArray(ranges)) return;

    ranges.forEach(range => {
      // parse "HH:mm" strings
      const parseHour = (s) => {
        if (!s) return null;
        const parts = s.split(":").map(p => parseInt(p, 10));
        if (Number.isNaN(parts[0])) return null;
        return parts[0] % 24;
      };
      const start = parseHour(range.start);
      const end = parseHour(range.end);
      if (start === null || end === null) return;

      if (end > start) {
        for (let h = start; h < end; h++) hourBins[h % 24].count += 1;
      } else {
        // wraps midnight
        for (let h = start; h < 24; h++) hourBins[h].count += 1;
        for (let h = 0; h < end; h++) hourBins[h].count += 1;
      }
    });
  });

  const hourData = hourBins.map(b => ({ name: `${b.hour}:00`, value: b.count, hour: b.hour }));

  // Create ticks every 5 hours for the hour chart (center 0 concept not relevant for hours; show 0,5,10,15,20)
  const hourTicks = [];
  for (let t = 0; t < 24; t += 5) hourTicks.push(t);

  // ---------- Render helpers ----------
  const renderBarWithLabels = ({ title, dataset, getColor = () => "#A6D86C", xKey = "name", yKey = "value", height = 320, ticks = null }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ width: "100%", height: isMobile ? Math.round(height * 0.8) : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataset}>
              <XAxis dataKey={xKey} tick={{ fontSize: isMobile ? 11 : 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: isMobile ? 11 : 12 }} />
              <Tooltip />
              <Bar dataKey={yKey} fill="#A6D86C" isAnimationActive={false}>
                {dataset.map((entry, idx) => (
                  <Cell key={`c-${idx}`} fill={getColor(entry, idx)} />
                ))}
                <LabelList dataKey={yKey} position="top" style={{ fontSize: isMobile ? 11 : 13 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPlaystylePie = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Playstyle Distribution</Typography>
        <Box sx={{ width: "100%", height: isMobile ? 220 : 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={playstyleData} dataKey="value" nameKey="name" outerRadius={isMobile ? 70 : 110} label={(entry) => `${entry.name} (${entry.value})`}>
                {playstyleData.map((entry, idx) => (
                  <Cell key={`p-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout={isMobile ? "vertical" : "horizontal"} verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  // ---------- Render ----------
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>📊 Guild Analytics</Typography>

      {/* Classes distribution (bar) */}
      {renderBarWithLabels({
        title: "Class Distribution",
        dataset: classesData.map(d => ({ name: d.name, value: d.value })),
        getColor: (entry) => CLASS_COLORS[entry.name] || CLASS_COLORS.OTHER,
        height: isMobile ? 260 : 360,
      })}

      {/* Age distribution (bar) */}
      {renderBarWithLabels({
        title: "Age Range Distribution",
        dataset: ageData.map(d => ({ name: d.name, value: d.value })),
        getColor: (entry) => AGE_COLORS[entry.name] || AGE_COLORS.UNKNOWN,
        height: isMobile ? 220 : 320,
      })}

      {/* Playstyle pie */}
      {renderPlaystylePie()}

      {/* Timezone distribution (bar) */}
      {renderBarWithLabels({
        title: "Active Players by UTC Offset (grouped)",
        dataset: timezoneData.map(d => ({ name: `UTC${d.offset>=0?"+":""}${d.offset}`, value: d.value, offset: d.offset })),
        getColor: () => "#A6D86C",
        height: isMobile ? 260 : 360,
      })}

      {/* Active time per UTC hour */}
      {renderBarWithLabels({
        title: "Active Players per UTC Hour (24h)",
        dataset: hourData.map(d => ({ name: d.name, value: d.value, hour: d.hour })),
        getColor: () => "#66BB6A",
        height: isMobile ? 300 : 420,
      })}

      {/* Favorite activities list (anonymous) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Favorite Activities (anonymous)</Typography>
          {favData.length === 0 ? (
            <Typography variant="body2">No data</Typography>
          ) : (
            favData.slice(0, 50).map((f, idx) => (
              <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: idx < favData.length - 1 ? "1px solid #eee" : "none" }}>
                <Typography variant="body2" sx={{ fontSize: isMobile ? 13 : 14 }}>{f.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.count}</Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
