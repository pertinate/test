import { captureHoldFullRs, ImageDetect } from "@alt1/base"
import * as OCR from "@alt1/ocr"
import { createWorker } from "tesseract.js"

const font8 = require("@alt1/ocr/dist/fonts/aa_8px_mono_new")

const colors: OCR.ColortTriplet[] = [[255, 255, 255]]

const fullInterface = { x: 0, y: 0, width: 316, height: 328 }
const resultsSubSection = { x: 6, y: 44, width: 306, height: 238 }

const headers = { Authorization: "Client-ID 93790a5883f0305" }

const captureGem = async () => {
    try {
        const fullInterfaceCapture = captureHoldFullRs()

        // To get subimages as png, capture interface, convert to data and convert to pngBase64
        // Finally use ImageDetect.imageDataFromBase64() to convert back to image and check the network tab to save png

        // Find gem interface in client
        const subImgLoc = fullInterfaceCapture.findSubimage(await ImageDetect.imageDataFromUrl("./englishHeader.png"))

        if (subImgLoc.length < 1) {
            subImgLoc.push(...fullInterfaceCapture.findSubimage(await ImageDetect.imageDataFromUrl("./frenchHeader.png")))
        }

        if (subImgLoc.length < 1) {
            subImgLoc.push(...fullInterfaceCapture.findSubimage(await ImageDetect.imageDataFromUrl("./germanHeader.png")))
        }

        if (subImgLoc.length > 0) {
            // Save sub location
            const x = subImgLoc[0].x
            const y = subImgLoc[0].y

            // Grab the raw pixels
            const fullGemCapture = fullInterfaceCapture.toData(x + fullInterface.x, y + fullInterface.y, fullInterface.width, fullInterface.height)
            const resultsCapture = fullInterfaceCapture.toData(
                x + resultsSubSection.x,
                y + resultsSubSection.y,
                resultsSubSection.width,
                resultsSubSection.height
            )

            // Start screenshot uploads to imgur
            const fullInterfaceFormdata = new FormData()
            fullInterfaceFormdata.append("image", await fullInterfaceCapture.toData().toPngBase64())

            const interfaceUploadProm = fetch("https://api.imgur.com/3/image", {
                method: "POST",
                headers,
                body: fullInterfaceFormdata
            })

            const gemFormdata = new FormData()
            gemFormdata.append("image", await fullGemCapture.toPngBase64())

            const gemUploadProm = fetch("https://api.imgur.com/3/image", {
                method: "POST",
                headers,
                body: gemFormdata
            })

            // Ready tesseract
            const worker = createWorker()

            await worker.load()
            await worker.loadLanguage("eng")
            await worker.initialize("eng")

            // Find gem score
            let rank: number | undefined = undefined
            let score: number | undefined = undefined

            for (let serchRank = 1; serchRank <= 10; serchRank++) {
                const heightOffset = 24 * (serchRank - 1)

                const player = OCR.findReadLine(resultsCapture, font8, colors, 124, 12 + heightOffset).text

                // const scoreString = OCR.findReadLine(resultsCapture, font8, colors, 245, 12 + heightOffset).text
                // const score = parseInt(scoreString, 10)

                if (player !== "") {
                    const {
                        data: { text: tesseractScoreString }
                    } = await worker.recognize(
                        `data:image/png;base64,${fullInterfaceCapture
                            .toData(x + resultsSubSection.x + 220, y + resultsSubSection.y + heightOffset + 4, 70, 13)
                            .toPngBase64()}`
                    )

                    const tempScore = parseInt(tesseractScoreString.replace(/[^0-9]/g, ""), 10)

                    if (!isNaN(tempScore)) {
                        rank = serchRank
                        score = tempScore
                    }
                }
            }

            // Cleanup tesseract
            await worker.terminate()

            // Await uploads
            const {
                data: { link: interfaceUploadLink }
            } = await (await interfaceUploadProm).json()

            const {
                data: { link: gemUploadLink }
            } = await (await gemUploadProm).json()

            // Add attachments
            if (typeof interfaceUploadLink === "string" && typeof gemUploadLink === "string") {
                return { interfaceUploadLink, gemUploadLink, score, rank }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export default captureGem
