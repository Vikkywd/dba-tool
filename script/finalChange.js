// const client = require('../config/db');

// async function updateDocuments() {
//   try {
//     await client.connect();
//     const db = client.db(process.env.DATABASE);
//     const collection = db.collection("eprescribeConfig");

//     const cursor = collection.find();

//     while (await cursor.hasNext()) {
//       const doc = await cursor.next();

//       const {
//         _id,
//         BusinessID,
//         CountryId,
//         CreatedBy,
//         CreatedDate,
//         ModifyBy,
//         ModifiedDate,
//         EPLastSentDate,
//         EPDueBilledDate,
//         ActiveStatus,
//         ApiKey,
//         BusinessUnitEntityId,
//         Email,
//         LastLoginDate,
//         OrganizationEntityId,
//         SessionToken,
//         VendorInviteId,
//         ModifiedBy,
//         Doctors = [],
//         MedicalAssistants = [],
//         Employees = []
//       } = doc;

//       // Extract embedded data from first employee if available
//       const employee = Employees[0] || {};
//       const { OnboardingStep, ScriptSureEmpId } = employee;

//       // Common fields to add
//       const enrichment = {
//         OnboardingStep,
//         ScriptSureEmpId,
//         PracticeId: doc.PracticeId // original top-level value
//       };

//       // Add fields to Doctors and MedicalAssistants
//       const updatedDoctors = Doctors.map(doc => ({ ...doc, ...enrichment }));
//       const updatedAssistants = MedicalAssistants.slice(0, 1).map(assist => ({ ...assist, ...enrichment }));

//       const updatedDoc = {
//         BusinessID,
//         CountryId,
//         CreatedBy,
//         CreatedDate,
//         ModifyBy,
//         ModifiedDate,
//         EPLastSentDate,
//         EPDueBilledDate,
//         ActiveStatus,
//         ApiKey,
//         BusinessUnitEntityId,
//         Email,
//         LastLoginDate,
//         OrganizationEntityId,
//         SessionToken,
//         VendorInviteId,
//         ModifiedBy,
//         Doctors: updatedDoctors,
//         MedicalAssistants: updatedAssistants
//       };
//       console.log(updatedDoc);
      

//       await collection.updateOne({ _id }, { $set: updatedDoc });
//     }

//     console.log("All documents transformed successfully.");
//   } catch (error) {
//     console.error("Error transforming documents:", error);
//   } finally {
//     await client.close();
//   }
// }

// updateDocuments();




const client = require('../config/db');

function reorderDocument(doc) {
  const reordered = {};
  const arrayFields = {};

  for (const key of Object.keys(doc)) {
    const value = doc[key];

    if (Array.isArray(value)) {
      arrayFields[key] = value; // Save array for later
    } else {
      reordered[key] = value;
    }
  }

  // Add arrays at the end
  for (const key in arrayFields) {
    reordered[key] = arrayFields[key];
  }

  return reordered;
}

async function reorderAllDocuments() {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE);
    const collection = db.collection('eprescribeConfig');

    const cursor = collection.find();
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const _id = doc._id;
      delete doc._id;

      const reorderedDoc = reorderDocument(doc);
    //   console.log('reorderedDoc: ', reorderedDoc);

      await collection.replaceOne({ _id }, reorderedDoc);
    }

    console.log("Reordering completed: array fields moved to the end.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

reorderAllDocuments();
