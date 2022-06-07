import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import {} from "@alt1/base"
import captureGem from "./captureGem"
import SavedGemsInterface, { SavedGem } from "./savedGems"
import windowHTML from "./windowHtml"

// alt1://addapp/https://ocfl8.csb.app/appconfig.json

const alt1 = window.alt1

function App() {
    const [loading, setLoading] = useState(false)

    const [hoverToUpload, setHoverToUpload] = useState<boolean>(JSON.parse(localStorage.getItem("hoverToUpload") || "true"))

    useEffect(() => {
        localStorage.setItem("hoverToUpload", JSON.stringify(hoverToUpload))
    }, [hoverToUpload])

    const [savedGems, setSavedGems] = useState<SavedGem[]>(JSON.parse(localStorage.getItem("results") || "[]"))

    const [logWindow, setLogWindow] = useState<Window | null>(null)
    const showLog = () => {
        const newWindow = window.open("", "Log", "width=750,height=500")

        if (newWindow) {
            if (newWindow.document.getElementById("root") === null) {
                newWindow.document.write(windowHTML)
            }

            setLogWindow(newWindow)
        }
    }

    const start = async () => {
        setLoading(true)

        const uploads = await captureGem()

        if (uploads) {
            const { interfaceUploadLink, gemUploadLink, score, rank } = uploads

            const updatedSavedGems = [...savedGems, { date: new Date(), interfaceUploadLink, gemUploadLink, score, rank }]

            localStorage.setItem("results", JSON.stringify(updatedSavedGems))
            setSavedGems(updatedSavedGems)
        }

        setTimeout(() => setLoading(false), 2500)
    }

    useEffect(() => {
        if (logWindow !== null) {
            ReactDOM.render(
                <SavedGemsInterface
                    savedGems={savedGems}
                    removeGem={(index) => {
                        const updatedSavedGems = [...savedGems]

                        updatedSavedGems.splice(index, 1)

                        localStorage.setItem("results", JSON.stringify(updatedSavedGems))
                        setSavedGems(updatedSavedGems)
                    }}
                />,
                logWindow.document.getElementById("root")
            )
        }
    })

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100%",
                minWidth: "100%",
                backgroundImage: "url(./background.png)"
            }}
        >
            <button onClick={showLog}>Show uploaded gems</button>

            <br />

            <button
                onMouseEnter={() => {
                    if (hoverToUpload) {
                        start()
                    }
                }}
                disabled={loading}
                onClick={start}
            >
                Capture & upload gem
            </button>

            <br />

            <div style={{ display: "flex", alignItems: "center" }}>
                <input type="checkbox" checked={hoverToUpload} onChange={() => setHoverToUpload(!hoverToUpload)} />
                <span style={{ color: "white", fontSize: 12 }}>Hover over capture to upload</span>
            </div>
        </div>
    )
}

const notFound = (
    <div className="App">
        <h1>ALT1 not found</h1>
    </div>
)

const rootElement = document.getElementById("root")
ReactDOM.render(alt1 ? <App /> : notFound, rootElement)

const clearPopupInterval = setInterval(() => {
    // Removes the "Open with sandbox button" as it won't scale
    // Super hate this but no other good options and this is already public
    // https://github.com/codesandbox/codesandbox-client/issues/3912
    document.body.querySelectorAll("iframe").forEach((iframe) => {
        if (iframe.id.startsWith("sb__open-sandbox")) {
            const node = document.createElement("div")
            node.style.setProperty("display", "none", "important")
            node.id = iframe.id
            document.getElementById(iframe.id)?.remove()
            document.body.appendChild(node)

            clearInterval(clearPopupInterval)
        }
    })
}, 250)
