export default async function handler(req, res) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const tableName = "table1";

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const headers = { Authorization: `Bearer ${apiKey}` };

    let allRecords = [];
    let offset;

    do {
      let queryUrl = url;
      if (offset) queryUrl += `?offset=${offset}`;

      const response = await fetch(queryUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch Airtable data");

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    const uniqueKeys = new Set();
    allRecords.forEach((record) => {
      Object.keys(record.fields).forEach((key) => uniqueKeys.add(key));
    });

    const processedRecords = allRecords.map((record) => {
      const newRecord = {};
      [...uniqueKeys].forEach((key) => {
        newRecord[key] = record.fields[key] || null;
      });
      newRecord.ID = record.id;
      newRecord.Avatar =
        record.fields.Avatar?.[0]?.url || "";

      return newRecord;
    });

    res.status(200).json(processedRecords);
  } catch (error) {
    console.error("Airtable API error:", error);
    res.status(500).json({ error: "Failed to fetch data from Airtable" });
  }
}
