import fs from "fs"
import { readFile, writeFile, utils } from "xlsx"
import furiganify from "./furiganify"

import {
  fileName,
  sheetNames,
  kanjiColumn,
  kanaColumn,
} from "./sheet.config.json"

const main = (): void => {
  // Check if file exists before trying to open it
  if (!fs.existsSync(fileName)) {
    console.log(`${fileName} does not exist`)
    return
  }
  const workbook = readFile(fileName)

  // Typeguard to ensure sheetNames is an Array
  if (!Array.isArray(sheetNames)) {
    console.log(`Please populate sheetNames in brackets [...]`)
    return
  }

  for (const sheetName of sheetNames) {
    // Turn sheet data into json format
    const data: Record<string, string>[] = utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { header: "A" }
    )

    // Ensure that data exists before continuing
    if (!data.length) {
      console.log(`${sheetName} is either empty or does not exist`)
    } else {
      // Furiganify each entry inside of the sheet
      for (const [i, entry] of data.entries()) {
        data[i] = {
          "Kanji[Hiragana]": furiganify(entry[kanjiColumn], entry[kanaColumn]),
          ...entry,
        }
      }

      // Append the furiganified sheet to the original and write it to file
      try {
        const furiganifiedSheet = utils.json_to_sheet(data)
        utils.book_append_sheet(
          workbook,
          furiganifiedSheet,
          `auto-furi-${sheetName}`
        )
        console.log(`${sheetName} was furiganified`)
      } catch {
        console.log(`Duplicate ${sheetName} was skipped`)
      }
    }
  }

  writeFile(workbook, fileName)
}

main()
