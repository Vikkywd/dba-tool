const fs = require('fs');
const { parse } = require('csv-parse');

// Function to parse CSV from a file and convert to JSON
function processCsvToJson(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    // Create a read stream for the CSV file
     const parser = fs
      .createReadStream(filePath)
      .pipe(
        parse({
          columns: true, // Treat first row as headers
          skip_empty_lines: true,
          trim: true,
          cast: (value, context) => {
            // Handle boolean values
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
            // Handle numeric values (e.g., MSRP, JDASKUNumber)
            if (context.column === 'MSRP' || context.column === 'JDASKUNumber') {
              return Number(value);
            }
            // Parse JSON string in the last column
            if (context.column === 'videoImage') {
              try {
                return JSON.parse(value.replace(/& K2 &/, '')); // Clean up malformed JSON
              } catch (e) {
                console.warn(`Failed to parse JSON in row ${context.row}: ${value}`);
                return value;
              }
            }
            // Handle strings with extra quotes (e.g., '"dsfds"' or "'dsfds'" to "dsfds")
            if (typeof value === 'string') {
              if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                return value.slice(1, -1); // Remove outer quotes
              }
            }
            return value;
          }
        })
      );

    // Process each row
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Structure the object as per need
        const product = {
            VendorProductId : record['product-id'],
            name : record["display-name"],
            brand : record['brandcustom'],
            // categoryId : record['']
            description : record["long-description"],
            MediaUrls : [
                    record["product-image"],record["product-alt-image"],
                    record["product-alt-swatch"],
                    record["videoLink"],
                    record["videoImage"]
                ],
            price : record["MSRP"],
            barcodeId : Number(record["upc"]),
            sku : record["JDASKUNumber"],
            IsRetail : record["salonhqavailable"],
            IsDropship : true,
            IsActive : record["salonhqavailable"],
            MinOrderQuantity : 0,
            MaxOrderQuantity : record["quantityLimit"] || 0,
            MaxAllowedDiscount : 0,
            DisplaySize : record["size"] || null,
            SizeValue : 0,
            SizeUnit : null,
            AdditionalDetails : [
                {
                  DetailTitle : record["directions"],
                  DetailDescription : record["directions"],
                  DetailTitle : record["featuresAndBenefits"],
                  DetailDescription : record["featuresAndBenefits"],
                }
            ]
        }
        product.MediaUrls = product.MediaUrls.filter((ele) => ele);
        results.push(product);
      }
    });

    // Handle errors
    parser.on('error', (err) => reject(err));

    // When parsing is complete
    parser.on('end', () => {
      // Write to JSON file
      fs.writeFile('products.json', JSON.stringify(results, null, 2), (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  });
}

// Execute the function with the path to your CSV file
const csvFilePath = 'ji.csv'; // Replace with your CSV file path
processCsvToJson(csvFilePath)
  .then((data) => console.log('JSON file created successfully:', data))
  .catch((err) => console.error('Error processing CSV:', err));