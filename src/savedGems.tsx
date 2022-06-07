import React, { useState } from "react"
import { format } from "date-fns"

import { openbrowser } from "@alt1/base"

export type SavedGem = { date: Date; interfaceUploadLink: string; gemUploadLink: string; score?: number; rank?: number }

const cellStyle = { border: "1px solid #dddddd", padding: 8 }

const SavedGemsInterface: React.FC<{ savedGems: SavedGem[]; removeGem: (index: number) => void }> = ({ savedGems, removeGem }) => {
    const [sortStyle, setSortStyle] = useState<{ column: keyof SavedGem; sort: boolean }>({ column: "date", sort: false })

    const sortableColumnHeader = (column: keyof SavedGem, displayName: string) => (
        <th style={{ ...cellStyle, cursor: "pointer" }} onClick={() => setSortStyle({ column, sort: sortStyle.column === column && !sortStyle.sort })}>
            <div style={{ position: "relative", paddingRight: "30", paddingLeft: "30" }}>
                {displayName}

                <img
                    alt=""
                    src={`./resources/arrow-${sortStyle.sort ? "up" : "down"}.svg`}
                    style={{ opacity: sortStyle.column === column ? 1 : 0 }}
                    height={20}
                    width={20}
                />
            </div>
        </th>
    )

    return (
        <table style={{ width: "100%", fontFamily: "arial, sans-serif", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    {sortableColumnHeader("date", "Date")}
                    {sortableColumnHeader("score", "Score")}
                    {sortableColumnHeader("rank", "Rank")}
                    <th style={cellStyle}>Gem screenshot</th>
                    <th style={cellStyle}>Interface screenshot</th>
                </tr>
            </thead>

            <tbody>
                {savedGems
                    .sort((a, b) => {
                        const columnComparison = (a[sortStyle.column] || 0) < (b[sortStyle.column] || 0)

                        return sortStyle.sort !== columnComparison ? 1 : -1
                    })
                    .map((savedGem, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 ? "#dddddd" : "#ffffff" }}>
                            <td style={cellStyle}>{format(new Date(savedGem.date), "HH:mm \t do MMM Y")}</td>

                            <td style={cellStyle}>{savedGem?.score || "?"}</td>

                            <td style={cellStyle}>{savedGem?.rank || "?"}</td>

                            <td
                                style={{ ...cellStyle, textDecoration: "underline", color: "blue", cursor: "pointer" }}
                                onClick={() => openbrowser(savedGem.gemUploadLink)}
                            >
                                link
                            </td>

                            <td
                                style={{ ...cellStyle, textDecoration: "underline", color: "blue", cursor: "pointer" }}
                                onClick={() => openbrowser(savedGem.interfaceUploadLink)}
                            >
                                link
                            </td>

                            <td style={cellStyle}>
                                <button onClick={() => removeGem(index)}>x</button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}

export default SavedGemsInterface
