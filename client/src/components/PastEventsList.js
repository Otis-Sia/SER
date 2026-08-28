"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Calendar, MapPin, FileText, ExternalLink } from "lucide-react";

function formatAuthorName(author) {
  if (!author) return "";
  if (author.includes("@")) {
    const raw = author.split("@")[0].replace(/[._-]/g, " ");
    return raw
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return author;
}

export default function PastEventsList({ pastEvents = [], reports = {} }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!pastEvents || pastEvents.length === 0) {
    return <p className="intro-text">No past events found.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      {pastEvents.map((event) => {
        const eventId = event.google_event_id || event.id;
        const report = reports[eventId];
        const isExpanded = expandedId === eventId;

        const startDate = new Date(event.event_date || event.eventDate || new Date());
        const formattedDate = startDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Africa/Nairobi"
        });
        const formattedTime = startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Nairobi"
        });

        return (
          <div
            key={eventId}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: isExpanded ? "2px solid var(--primary-color, #129a44)" : "1px solid #e5e7eb",
              boxShadow: isExpanded ? "0 10px 15px -3px rgba(0, 0, 0, 0.08)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              transition: "all 0.2s ease"
            }}
          >
            {/* Header (Tappable Row) */}
            <div
              onClick={() => toggleExpand(eventId)}
              style={{
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                gap: "1rem",
                flexWrap: "wrap",
                backgroundColor: isExpanded ? "rgba(18, 154, 68, 0.03)" : "transparent"
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(eventId); }}
            >
              {/* Left Side: Date & Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flex: 1, minWidth: "260px" }}>
                <div
                  style={{
                    backgroundColor: "rgba(18, 154, 68, 0.1)",
                    color: "var(--primary-color, #129a44)",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    textAlign: "center",
                    minWidth: "90px",
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {formattedDate.split(" ")[1]} {formattedDate.split(" ")[2]}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "800", lineHeight: 1.1 }}>
                    {formattedDate.split(" ")[0]}
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 0.35rem 0", fontSize: "1.2rem", fontWeight: "700", color: "#111827" }}>
                    {event.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#6b7280" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} /> {formattedTime}
                    </span>
                    {event.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={14} /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Report Badge & Chevron */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                {report ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "999px",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      border: "1px solid #bbf7d0"
                    }}
                  >
                    <FileText size={14} /> Read Report
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "999px",
                      backgroundColor: "#f3f4f6",
                      color: "#6b7280"
                    }}
                  >
                    Event Details
                  </span>
                )}

                <div
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    color: "var(--primary-color, #129a44)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <ChevronDown size={22} />
                </div>
              </div>
            </div>

            {/* Expanded Content (On Tap) */}
            {isExpanded && (
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff"
                }}
              >
                {report ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: "var(--primary-color, #129a44)" }}>
                          Event Summary &amp; Report
                        </span>
                        <h4 style={{ margin: "0.25rem 0 0 0", fontSize: "1.4rem", fontWeight: "700", color: "#1f2937" }}>
                          {report.title}
                        </h4>
                      </div>
                      <Link
                        href={`/events/${eventId}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: "var(--primary-color, #129a44)",
                          textDecoration: "underline"
                        }}
                      >
                        Open Event Page <ExternalLink size={14} />
                      </Link>
                    </div>

                    {/* Rich Text / WYSIWYG Content */}
                    <div
                      className="event-report-body"
                      style={{
                        fontSize: "1.05rem",
                        lineHeight: "1.75",
                        color: "#374151",
                        marginBottom: "1.5rem"
                      }}
                      dangerouslySetInnerHTML={{ __html: report.content_md }}
                    />

                    {report.author && (
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          fontStyle: "italic",
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: "0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "0.5rem"
                        }}
                      >
                        <span>Report compiled by: <strong>{formatAuthorName(report.author)}</strong></span>
                        {report.updated_at && (
                          <span>Published: {new Date(report.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#374151" }}>
                      Event Overview
                    </h4>
                    <p style={{ color: "#6b7280", lineHeight: "1.6", margin: "0 0 1rem 0" }}>
                      {event.description || "No description provided for this session."}
                    </p>
                    <div style={{ backgroundColor: "#f9fafb", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.9rem", color: "#6b7280", border: "1px dashed #d1d5db" }}>
                      ℹ️ A written report has not been submitted for this session yet.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
