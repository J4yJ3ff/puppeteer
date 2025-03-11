export default function Results({ data }) {
    if (!data) return null;

    const handleUpload = async () => {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scrapedData),
          });
          const result = await response.json();
          alert(`Product uploaded! ID: ${result.id}`);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      };
  
    return (
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Scraped Data</h2>
        <div className="space-y-2">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Price:</strong> ${data.price}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <div>
            <strong>Images:</strong>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {data.images?.map((img, i) => (
                <img key={i} src={img} className="w-full h-32 object-cover" />
              ))}
            </div>
          </div>
        </div>

        <button 
  onClick={handleUpload}
  className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
>
  Upload to WooCommerce
</button
      </div>
    );
  }