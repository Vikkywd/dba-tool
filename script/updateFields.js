const { Long } = require('mongodb');
const client = require('../config/db');

async function updateFieldTypes() {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE);
    const collection = db.collection("eprescribeConfig");

    const cursor = collection.find();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const originalId = doc._id;

      // Convert specified fields
      if (doc.ModifiedBy) doc.ModifiedBy = parseInt(doc.ModifiedBy); // to int
      if (doc.BusinessID) doc.BusinessID = Long.fromNumber(doc.BusinessID); // to NumberLong
      if (doc.ServiceProviderId) doc.ServiceProviderId = Long.fromNumber(doc.ServiceProviderId);

      // Convert nested Doctors[].ServiceProviderID
      if (Array.isArray(doc.Doctors)) {
        doc.Doctors = doc.Doctors.map(d => ({
          ...d,
          ServiceProviderID: Long.fromNumber(d.ServiceProviderID)
        }));
      }

      // Convert nested MedicalAssistants[].ServiceProviderID
      if (Array.isArray(doc.MedicalAssistants)) {
        doc.MedicalAssistants = doc.MedicalAssistants.map(m => ({
          ...m,
          ServiceProviderID: Long.fromNumber(m.ServiceProviderID)
        }));
      }

      await collection.replaceOne({ _id: originalId }, doc);
    //   console.log(`Updated: ${originalId}`);
    }

    console.log("Field type updates complete.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

updateFieldTypes();
