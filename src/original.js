const XLSX = require("xlsx")
const wanakana = require("wanakana")

const furiganify = (kanji, kana) => {
  const inputString = kanji
  let kanaString = kana
  const stringTokens = wanakana.tokenize(inputString)

  for (const [i, token] of stringTokens.entries()) {
    if (i >= 1 && wanakana.isKana(token)) {
      // Split kana string into pieces based on where the token appears,
      const splitKana = kanaString.split(wanakana.toHiragana(token))

      // Give first piece of split kana string to the previous token
      // If the first piece of split kana doesn't exist,
      // Make furigana equal to the Token + second piece
      const frontKana = splitKana.shift()
      const furigana = frontKana ? frontKana : token + splitKana.shift()
      stringTokens[i - 1] = `${stringTokens[i - 1]}[${furigana}]`

      // Make kana string equal to the remaining split kana
      kanaString = splitKana.join("")

      // For the last token add remaining kana to it
    } else if (stringTokens.slice(-1)[0] == token) {
      stringTokens[i] = `${stringTokens[i]}[${kanaString}]`
    }
  }

  // Recombine all tokens
  return kanji ? stringTokens.join("") : kana
}

const main = () => {
  const workbook = XLSX.readFile("test.xlsx")
  const sheetName = "Chapter 5"
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  console.log(data)

  // Furiganify each entry inside of the sheet
  for (const [i, entry] of data.entries()) {
    data[i] = {
      "Kanji[Hiragana]": furiganify(
        entry["Vocab (Kanji)"],
        entry["Vocab (Kana)"]
      ),
      ...entry,
    }
  }

  // Append the furiganified sheet to the original and write it to file
  const furiganifiedSheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(
    workbook,
    furiganifiedSheet,
    `auto-furi-${sheetName}`
  )
  XLSX.writeFile(workbook, "a.xlsx")
}

main()
