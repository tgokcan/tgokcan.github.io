"use client";

import { useMemo, useState } from "react";
import { Column, Row, Text } from "@once-ui-system/core";
import type { ContributionDay } from "@/lib/github";
import styles from "./ContributionGraph.module.scss";

interface ContributionGraphProps {
  total: number;
  contributions: ContributionDay[];
  username: string;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function groupByWeeks(contributions: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of contributions) {
    const dayOfWeek = new Date(`${day.date}T00:00:00`).getDay();

    if (currentWeek.length === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: "", count: 0, level: -1 });
      }
    }

    currentWeek.push(day);

    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: 0, level: -1 });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getMonthPositions(weeks: ContributionDay[][]): { label: string; weekIndex: number }[] {
  const positions: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d) => d.date);
    if (!firstValidDay) return;

    const date = new Date(`${firstValidDay.date}T00:00:00`);
    const month = date.getMonth();

    if (month !== lastMonth) {
      positions.push({ label: MONTH_LABELS[month], weekIndex });
      lastMonth = month;
    }
  });

  return positions;
}

export function ContributionGraph({ total, contributions, username }: ContributionGraphProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const weeks = useMemo(() => groupByWeeks(contributions), [contributions]);
  const monthPositions = useMemo(() => getMonthPositions(weeks), [weeks]);

  const handleMouseEnter = (
    day: ContributionDay,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!day.date) return;

    const date = new Date(`${day.date}T00:00:00`);
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const contributionText =
      day.count === 0
        ? "No contributions"
        : `${day.count} contribution${day.count > 1 ? "s" : ""}`;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text: `${contributionText} on ${formatted}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  return (
    <Column fillWidth gap="12" paddingTop="16" className={styles.container}>
      <Row fillWidth horizontal="between" vertical="center">
        <Text variant="body-default-s" onBackground="neutral-weak">
          <Text as="span" weight="strong" onBackground="neutral-strong">
            {total.toLocaleString()}
          </Text>{" "}
          contributions in the last year
        </Text>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.profileLink}
        >
          @{username}
        </a>
      </Row>

      <div className={styles.graphWrapper}>
        <div className={styles.monthLabels}>
          {monthPositions.map(({ label, weekIndex }) => (
            <span
              key={`${label}-${weekIndex}`}
              className={styles.monthLabel}
              style={{ gridColumnStart: weekIndex + 2 }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className={styles.graph}>
          <div className={styles.dayLabels}>
            {DAY_LABELS.map((label, index) => (
              <span key={index} className={styles.dayLabel}>
                {label}
              </span>
            ))}
          </div>

          <div className={styles.weeks}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className={styles.week}>
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={styles.day}
                    data-level={day.level >= 0 ? day.level : undefined}
                    data-empty={day.level < 0 ? "true" : undefined}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Row gap="4" vertical="center" horizontal="end">
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Less
        </Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={styles.legendDay} data-level={level} />
        ))}
        <Text variant="body-default-xs" onBackground="neutral-weak">
          More
        </Text>
      </Row>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </Column>
  );
}
