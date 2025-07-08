<?php
  $jsonString = json_decode(file_get_contents('php://input'), true);
  $data = $jsonString["data"];
  $fname = $jsonString["fname"];
  $time = date("Y-m-d-H-i-s");
  file_put_contents('data/mutex-' . $fname . '-' . $time . '.json', $data, true);
  echo '{ "success": true }';
?>
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['csvFile']) && $_FILES['csvFile']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['csvFile']['tmp_name'];
        $fileName = $_FILES['csvFile']['name']; // Use the original file name as passed over from js
        
        // Set the path to the current directory
        $dest_path = './' . $fileName;

        // Move the file to the current directory
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            // Set file permissions to 644: read/write for owner, read-only for others
            chmod($dest_path, 0640);
            echo "File successfully uploaded to " . $dest_path;
        } else {
            echo "Error moving the file to the current directory.";
        }
    } else {
        echo "No file uploaded or an error occurred.";
    }
}
?>
