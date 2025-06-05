const client = require('../config/db');



function toPascalCase(str) {
  return str.replace(/(^\w|_\w)/g, s => s.replace('_', '').toUpperCase());
}

function transformKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map(transformKeys);
    } else if (obj instanceof Date) {
      return obj; 
    } else if (obj && typeof obj === 'object') {
      const newObj = {};
      for (const key in obj) {
        const pascalKey = toPascalCase(key);
        newObj[pascalKey] = transformKeys(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

async function updateAllDocuments() {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collection = db.collection("eprescribeConfig");

    const cursor = collection.find();
    const newArr = []
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const originalId = doc._id; // ✅ Save _id before deleting it
      delete doc._id;
      const transformedDoc = transformKeys(doc);

      // Add new fields
      transformedDoc.OwnerId = 67890;

    
      transformedDoc.ModifiedBy = Number("8888888888888888");
      transformedDoc.DoctorsCount = transformedDoc.Doctors?.length || 0;
      transformedDoc.MedicalAssistant = transformedDoc.MedicalAssistants?.length || 0;
      transformedDoc.Employees = [
        {
          ScriptSureUserType: 1,
          OnboardingStep: 2,
          ScriptSureEmpId: 12587,
          ServiceProviderId: 45454
        }
      ];

      
    //   newArr.push(originalId)
      // Replace the document
      await collection.replaceOne({ _id: originalId}, transformedDoc);
    }

    console.log("All documents updated successfully.",newArr );
  } catch (err) {
    console.error("Error updating documents:", err);
  } finally {
    await client.close();
  }
}

updateAllDocuments();
