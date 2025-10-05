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
import { useTheme } from "@mui/material/styles";
import WordCloudComponent from "../../../components/WordCloud";

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
  const theme = useTheme();

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch("/api/approved");
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        console.log('Fetched data:', result);
        
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

  const tzToOffsetHours = (tz) => {
    if (!tz) return 0;
    try {
      const m = tz.match(/([UuGg][Tt][Cc]?|GMT)?\s*([+-]\d{1,2})(:?(\d{2}))?/);
      if (m && (m[2] || m[3])) {
        const h = parseInt(m[2], 10);
        const mins = m[4] ? parseInt(m[4], 10) : 0;
        return h + mins / 60;
      }
      const dt = DateTime.now().setZone(tz);
      if (dt.isValid) return dt.offset / 60;
    } catch (e) {}
    return 0;
  };

  // ---------- Process Data ----------
  const classesCount = data.reduce((acc, cur) => {
    const cls = safeString(cur.planned_main_class);
    const abbr = CLASS_ABBR[cls] || (cls ? cls.slice(0,2).toUpperCase() : "OT");
    acc[abbr] = (acc[abbr] || 0) + 1;
    return acc;
  }, {});
  const classesData = Object.entries(classesCount)
    .map(([name, value]) => ({ name, value, color: CLASS_COLORS[name] || CLASS_COLORS.OTHER }))
    .sort((a,b) => b.value - a.value);

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

  const favCount = data.reduce((acc, cur) => {
    const activity = (cur.favourite_bpsr_activity || "Unknown").trim();
    if (!activity) return acc;
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {});
  const favData = Object.entries(favCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a,b) => b.count - a.count);

  const tzMap = data.reduce((acc, cur) => {
    const tz = cur.timezone;
    const off = Math.round(tzToOffsetHours(tz));
    acc[off] = (acc[off] || 0) + 1;
    return acc;
  }, {});
  const tzEntries = Object.entries(tzMap)
    .map(([k, v]) => ({ offset: parseInt(k, 10), value: v }))
    .sort((a,b) => a.offset - b.offset);
  const timezoneData = tzEntries.map(e => ({ name: `UTC${e.offset>=0?"+":""}${e.offset}`, value: e.value, offset: e.offset }));

  const hourBins = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  data.forEach(member => {
    const ranges = member.active_time_utc;
    if (!ranges || !Array.isArray(ranges)) return;
    ranges.forEach(range => {
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
        for (let h = start; h < 24; h++) hourBins[h].count += 1;
        for (let h = 0; h < end; h++) hourBins[h].count += 1;
      }
    });
  });
  const hourData = hourBins.map(b => ({ name: `${b.hour}:00`, value: b.count, hour: b.hour }));

  // ---------- Render helpers ----------
  const renderBarWithLabels = ({
  title,
  dataset,
  getColor = () => "#A6D86C",
  xKey = "name",
  yKey = "value",
  height = 320,
  renderLabel, // optional
  tooltipFormatter, // optional
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ width: "100%", height: isMobile ? Math.round(height * 0.8) : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataset} margin={{ top: 30, right: 10, bottom: 5, left: 10 }}>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: isMobile ? 11 : 12, fill: theme.palette.text.primary }}
              tickFormatter={(val, idx) => renderLabel ? renderLabel(dataset[idx]) : val}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: isMobile ? 11 : 12, fill: theme.palette.text.primary }} />
            <Tooltip
              contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
              formatter={(value, name, props) => tooltipFormatter ? [value, tooltipFormatter(props.payload)] : [value, name]}
              labelStyle={{ color: theme.palette.text.primary }}
              itemStyle={{ color: theme.palette.text.primary }}
            />
            <Bar dataKey={yKey} isAnimationActive={false}>
              {dataset.map((entry, idx) => (
                <Cell key={`c-${idx}`} fill={getColor(entry, idx)} />
              ))}
              <LabelList dataKey={yKey} position="top" style={{ fontSize: isMobile ? 11 : 13, fill: theme.palette.text.primary }} />
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
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: "1px solid #ccc",
                  color: theme.palette.text.primary,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                itemStyle={{ color: theme.palette.text.primary }}
              />
              <Legend layout={isMobile ? "vertical" : "horizontal"} verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

 const renderActiveTimeHeatmap = () => {
  const localOffset = new Date().getTimezoneOffset() / -60; // in hours, e.g., +5.5 for IST

  // Map data to local hours (0-23)
const hourMap = Array.from({ length: 24 }, (_, i) => ({
  localHour: i,
  value: 0,
  hour: null, // placeholder for UTC hour
}));

// Fill hourMap with actual counts
hourData.forEach(d => {
  const localHour = Math.floor((d.hour + localOffset + 24) % 24); // <-- FLOOR to integer
  hourMap[localHour].value += d.value; // accumulate if fractional overlaps
  hourMap[localHour].hour = d.hour;
});


  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Time Heatmap (Your Local Time)
        </Typography>
        <Box sx={{ width: "100%", height: isMobile ? 200 : 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourMap}  margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <XAxis
                dataKey="localHour"
                type="category"
                domain={[0, 23]}
                tick={{ fontSize: isMobile ? 11 : 12, fill: theme.palette.text.primary }}
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: isMobile ? 11 : 12, fill: theme.palette.text.primary }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: theme.palette.background.paper, border: "1px solid #ccc", color: theme.palette.text.primary }}
                formatter={(value) => [value, "Players"]}
                labelStyle={{ color: theme.palette.text.primary }}
                itemStyle={{ color: theme.palette.text.primary }}
                labelFormatter={(label) => {
                  const utcHour = hourMap[label]?.hour ?? "-";
                  return `Local: ${label}:00 | UTC: ${utcHour !== null ? utcHour + ":00" : "-"}`;
                }}

              />
              <Bar
                dataKey="value"
                isAnimationActive={false}
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  const maxCount = Math.max(...hourMap.map(d => d.value), 1);
                  const intensity = payload.value / maxCount;
                  // Gradient: green → yellow → red
                  let fillColor;
                  if (intensity < 0.5) {
                    const ratio = intensity / 0.5;
                    fillColor = `rgb(${Math.round(166 + ratio * (255-166))}, ${Math.round(216 + ratio * (255-216))}, 100)`;
                  } else {
                    const ratio = (intensity - 0.5) / 0.5;
                    fillColor = `rgb(255, ${Math.round(255 - ratio * 255)}, 100)`;
                  }
                  return <rect x={x} y={y} width={width} height={height} fill={fillColor} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};



  // ---------- Render ----------
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>📊 Guild Analytics</Typography>

      {renderBarWithLabels({
        title: "Class Distribution",
        dataset: classesData.map(d => ({
          name: d.name, // abbreviation for mobile
          fullName: Object.entries(CLASS_ABBR).find(([k,v]) => v === d.name)?.[0] || d.name,
          value: d.value,
        })),
        getColor: (entry) => CLASS_COLORS[entry.name] || CLASS_COLORS.OTHER,
        height: isMobile ? 260 : 360,
        // Custom tickFormatter for X-axis
        xKey: "name",
        renderLabel: (entry) => isMobile ? entry.name : entry.fullName,
        tooltipFormatter: (entry) => isMobile ? entry.name : entry.fullName,
      })}


      {renderBarWithLabels({
        title: "Age Range Distribution",
        dataset: ageData.map(d => ({ name: d.name, value: d.value })),
        getColor: (entry) => AGE_COLORS[entry.name] || AGE_COLORS.UNKNOWN,
        height: isMobile ? 220 : 320,
      })}

      {renderPlaystylePie()}

      {renderBarWithLabels({
        title: "Active Players by UTC Offset (grouped)",
        dataset: timezoneData.map(d => ({ name: `UTC${d.offset>=0?"+":""}${d.offset}`, value: d.value, offset: d.offset })),
        getColor: () => "#A6D86C",
        height: isMobile ? 260 : 360,
      })}

      {renderBarWithLabels({
        title: "Active Players per UTC Hour (24h)",
        dataset: hourData.map(d => ({ name: d.name, value: d.value, hour: d.hour })),
        getColor: () => "#66BB6A",
        height: isMobile ? 300 : 420,
      })}

      {renderActiveTimeHeatmap()}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Favorite Activities (anonymous)</Typography>
          {favData.length === 0 ? (
            <Typography variant="body2">No data</Typography>
          ) : (
            <Box sx={{ 
              width: '100%',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: { xs: 280, sm: 350, md: 400 },
              p: { xs: 1, sm: 2 }
            }}>
              <WordCloudComponent 
                words={favData} 
                width={isMobile ? window.innerWidth - 100 : 600} 
                height={isMobile ? 280 : 400}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
