"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  useMediaQuery
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { DateTime } from "luxon"; // for timezone offset conversion

const COLORS = ["#ff9999", "#A6D86C", "#99ff99", "#ffcc99", "#c266ff", "#ffb366"]; // green

export default function GuildAnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:768px)"); // MUI hook for mobile

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch("/api/approved");
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
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

  // ===== Transformations =====
  const classesData = Object.entries(
    data.reduce((acc, cur) => {
      const shortName = cur.planned_main_class.length > 10
        ? cur.planned_main_class.slice(0, 10) + "…"
        : cur.planned_main_class;
      acc[shortName] = (acc[shortName] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const ageData = Object.entries(
    data.reduce((acc, cur) => {
      acc[cur.age_range] = (acc[cur.age_range] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const playstyleData = Object.entries(
    data.reduce((acc, cur) => {
      acc[cur.playstyle] = (acc[cur.playstyle] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const favActivities = Object.entries(
    data.reduce((acc, cur) => {
      const activity = cur.favourite_bpsr_activity || "Unknown";
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // Convert timezone to UTC offset string
  const getUTCOffset = (tz) => {
    try {
      return "UTC" + DateTime.now().setZone(tz).toFormat("ZZ");
    } catch {
      return "UTC+0";
    }
  };

  // Bar chart: timezone count (converted to UTC offset)
  const timezoneMap = data.reduce((acc, cur) => {
    const offset = getUTCOffset(cur.timezone);
    acc[offset] = (acc[offset] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by numeric UTC offset
  const timezoneData = Object.entries(timezoneMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const getOffset = (str) => {
        const match = str.match(/UTC([+-]\d+):?(\d+)?/);
        if (!match) return 0;
        return parseInt(match[1], 10) + (parseInt(match[2] || "0", 10) / 60);
      };
      return getOffset(a.name) - getOffset(b.name);
    });

  // Active players per UTC hour (24h)
  const hourBins = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  data.forEach(member => {
    if (member.active_time_utc) {
      member.active_time_utc.forEach(range => {
        const start = parseInt(range.start.split(":")[0], 10);
        const end = parseInt(range.end.split(":")[0], 10);
        if (end > start) {
          for (let h = start; h < end; h++) hourBins[h % 24].count += 1;
        } else {
          for (let h = start; h < 24; h++) hourBins[h].count += 1;
          for (let h = 0; h < end; h++) hourBins[h].count += 1;
        }
      });
    }
  });

  const hourData = hourBins.map(bin => ({
    name: `${bin.hour}:00`,
    value: bin.count,
  }));

  // ===== Render functions =====
  const renderPie = (title, dataset) => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <PieChart>
            <Pie
            data={dataset}
            dataKey="value"
            nameKey="name"
            outerRadius={isMobile ? 70 : 120}
            label={false} // hide labels inside slices
            isAnimationActive={false}
            >
            {dataset.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
            {!isMobile && <Tooltip />} {/* Disable hover tooltip on mobile */}
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );

  const renderBar = (title, dataset, color = "#A6D86C") => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <BarChart data={dataset}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderFavActivitiesList = (title, activities) => (
    <Card sx={{ mb: 4, maxHeight: 400, overflowY: "auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={`${activity.name} (${activity.count})`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>📊 Guild Analytics</Typography>

      {renderPie("Class Distribution", classesData)}
      {renderPie("Age Range Distribution", ageData)}
      {renderPie("Playstyle Distribution", playstyleData)}

      {renderBar("Active Players per UTC Offset", timezoneData)}

      {renderBar("Active Players per UTC Hour (24h)", hourData)}

      {renderFavActivitiesList("Favorite Activities (Anonymous)", favActivities)}
    </Container>
  );
}
