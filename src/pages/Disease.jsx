import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import app from '../functions/firebase'; // Adjust the import path as per your project structure
const auth = getAuth(app);
const db = getFirestore(app);

const Disease = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diseaseName, setDiseaseName] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState('');
  const hasReadAloud = useRef(false);

  const readAloud = (text) => {
    console.log("readAloud called with text:", text);
    if ('speechSynthesis' in window) {
      console.log("Speech synthesis supported");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Set the language
      utterance.rate = 1; // Speed of speech
      utterance.pitch = 1; // Pitch of speech
      if (!hasReadAloud.current) {
        console.log("Speaking the text");
        window.speechSynthesis.speak(utterance);
        hasReadAloud.current = true;
      } else {
        console.log("Text has already been read aloud");
      }
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  };

  useEffect(() => {
    const welcomeText = "Upload image to detect crop diseases. Click on the Upload Image button to get started.";
    readAloud(welcomeText);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:5000/getdiseases', formData);
        setDiseaseName(response.data.disease_name);
        setResultImageUrl(response.data.image_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        setDiseaseName('Error detecting disease.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoURL = canvas.toDataURL('image/png');
        setImage(photoURL);
        setLoading(true);

        const formData = new FormData();
        formData.append('image', dataURLtoFile(photoURL));

        axios.post('http://localhost:5000/getdiseases', formData)
          .then(response => {
            setDiseaseName(response.data.disease_name);
            setResultImageUrl(response.data.image_url);
          })
          .catch(error => {
            console.error('Error uploading image:', error);
            setDiseaseName('Error detecting disease.');
          })
          .finally(() => {
            setLoading(false);
            stream.getTracks().forEach((track) => track.stop());
          });
      };

      const confirmCapture = window.confirm('Click OK to capture the photo.');
      if (confirmCapture) {
        capturePhoto();
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
      alert('Unable to access the camera. Please ensure camera permissions are enabled.');
    }
  };

  const dataURLtoFile = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], 'image.png', { type: mime });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:5000/getdiseases', formData);
        setDiseaseName(response.data.disease_name);
        setResultImageUrl(response.data.image_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        setDiseaseName('Error detecting disease.');
      } finally {
        setLoading(false);
      }
    }
  };

  const diagnoseCropDisease = (diseaseLabel) => {
    let diagnosis = '';
    let solutions = [];

    if (diseaseLabel === "Apple leaf") {
      diagnosis = "Diagnosis: General issues with apple leaves.";
      solutions = [
        "Ensure proper watering: Apple trees require consistent moisture, especially during dry spells. Overwatering or underwatering can stress the tree and lead to leaf issues.",
        "Use appropriate fertilizers: Apply balanced fertilizers to provide essential nutrients. Avoid excessive nitrogen, which can promote leaf growth at the expense of fruit production.",
        "Monitor for pests and diseases: Regularly inspect leaves for signs of pests like aphids, mites, or fungal infections such as powdery mildew.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between trees: Adequate spacing ensures good air circulation, reducing the risk of fungal diseases.",
        "Apply organic mulch: Mulch helps retain soil moisture and regulate temperature, promoting healthy root systems.",
        "Use neem oil for pest control: Neem oil is an organic solution that can deter pests and treat fungal infections.",
        "Implement crop rotation: Avoid planting apples in the same location year after year to reduce soil-borne diseases.",
        "Ensure adequate sunlight: Apple trees need at least 6-8 hours of sunlight daily for optimal growth.",
        "Use disease-resistant varieties: Choose apple varieties that are resistant to common diseases like apple scab or fire blight."
      ];
    } else if (diseaseLabel === "Apple rust leaf") {
      diagnosis = "Diagnosis: Apple rust is caused by Gymnosporangium species, a fungal pathogen that requires both apple trees and juniper hosts to complete its life cycle.";
      solutions = [
        "Remove nearby juniper hosts: Eliminate juniper plants within a 2-mile radius to break the disease cycle.",
        "Apply fungicides: Use fungicides like myclobutanil or sulfur-based sprays during the growing season to prevent infection.",
        "Plant resistant varieties: Choose apple varieties that are less susceptible to rust, such as 'Liberty' or 'Freedom.'",
        "Prune affected branches: Remove and destroy infected branches to reduce the spread of the fungus.",
        "Ensure proper air circulation: Prune trees to improve airflow, which helps leaves dry faster and reduces fungal growth.",
        "Avoid overhead watering: Water at the base of the tree to keep leaves dry and minimize fungal spore germination.",
        "Use sulfur-based sprays: Sulfur is effective against rust and can be applied preventatively.",
        "Monitor for early signs of infection: Look for yellow-orange spots on leaves, which are the first signs of rust.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Use organic compost to improve soil health: Healthy soil supports strong tree growth, making it more resistant to diseases."
      ];
    } else if (diseaseLabel === "Bell_pepper leaf spot") {
      diagnosis = "Diagnosis: Bell pepper leaf spot is often caused by bacteria (Xanthomonas spp.) or fungi (Cercospora spp.), leading to circular or irregular spots on leaves.";
      solutions = [
       "Use disease-free seeds: Start with certified seeds to avoid introducing pathogens.",
        "Apply appropriate fungicides or bactericides: Use copper-based sprays for bacterial spots and fungicides like chlorothalonil for fungal spots.",
        "Practice crop rotation: Avoid planting peppers in the same soil for at least 3 years to reduce disease buildup.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry and prevent spore germination.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the disease.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Use drip irrigation: Drip systems deliver water directly to the roots, minimizing leaf wetness.",
        "Monitor for early signs of infection: Look for small, water-soaked spots that may turn brown or yellow.",
        "Use copper-based sprays: Copper is effective against bacterial leaf spot and can be applied preventatively.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."
      ];
    } else if (diseaseLabel === "Bell_pepper leaf") {
      diagnosis = "Diagnosis: General issues with bell pepper leaves.";
      solutions = [
        "Ensure proper watering: Bell peppers need consistent moisture but are sensitive to waterlogged soil.",
        "Use appropriate fertilizers: Apply a balanced fertilizer with equal parts nitrogen, phosphorus, and potassium.",
        "Monitor for pests and diseases: Watch for aphids, spider mites, and fungal infections like powdery mildew.",
        "Prune affected leaves: Remove damaged or diseased leaves to improve plant health.",
        "Maintain proper spacing between plants: Adequate spacing reduces competition for nutrients and improves airflow.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many common pepper pests.",
        "Implement crop rotation: Rotate peppers with non-solanaceous crops to reduce disease risk.",
        "Ensure adequate sunlight: Bell peppers need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like bacterial spot or mosaic virus."
      ];
    } else if (diseaseLabel === "Blueberry leaf") {
      diagnosis = "Diagnosis: General issues with blueberry leaves.";
      solutions = [
        "Ensure proper soil pH (4.5-5.5): Blueberries require acidic soil for optimal growth. Test soil pH and amend with sulfur if necessary.",
        "Use appropriate fertilizers: Apply fertilizers formulated for acid-loving plants, such as those high in ammonium sulfate.",
        "Monitor for pests and diseases: Watch for signs of blueberry maggot, mites, or fungal diseases like anthracnose.",
        "Prune affected leaves: Remove diseased or damaged leaves to improve plant health.",
        "Maintain proper spacing between plants: Good spacing ensures adequate airflow and sunlight penetration.",
        "Apply organic mulch: Mulch helps retain moisture and regulate soil temperature.",
        "Use neem oil for pest control: Neem oil is effective against many blueberry pests.",
        "Implement crop rotation: Rotate blueberries with non-related crops to reduce disease risk.",
        "Ensure adequate sunlight: Blueberries need at least 6 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like mummy berry or leaf spot."
      ];
    } else if (diseaseLabel === "Cherry leaf") {
      diagnosis = "Diagnosis: General issues with cherry leaves.";
      solutions = [
        "Ensure proper watering: Cherry trees need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for cherry fruit fly, aphids, or fungal infections like cherry leaf spot.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between trees: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many cherry pests.",
        "Implement crop rotation: Avoid planting cherries in the same location year after year.",
        "Ensure adequate sunlight: Cherry trees need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like brown rot or leaf spot."
      ];
    } else if (diseaseLabel === "Corn Gray leaf spot") {
      diagnosis = "Diagnosis: Corn Gray leaf spot is caused by the fungus Cercospora zeae-maydis, which thrives in warm, humid conditions.";
      solutions = [
        "Use resistant hybrids: Plant corn varieties that are resistant to gray leaf spot.",
        "Rotate crops: Avoid planting corn in the same field for consecutive years to reduce fungal spores in the soil.",
        "Apply fungicides if necessary: Use fungicides like azoxystrobin or pyraclostrobin during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Monitor for early signs of infection: Look for small, rectangular gray spots on leaves.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."
      ];
    } else if (diseaseLabel === "Corn leaf blight") {
      diagnosis = "Diagnosis: Corn leaf blight is caused by the fungus Exserohilum turcicum, which thrives in warm, humid conditions.";
      solutions = [
        "Plant resistant hybrids: Choose corn varieties that are resistant to leaf blight.",
        "Rotate crops: Avoid planting corn in the same field for consecutive years to reduce fungal spores in the soil.",
        "Use fungicides if necessary: Apply fungicides like chlorothalonil or mancozeb during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Monitor for early signs of infection: Look for long, elliptical lesions on leaves.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."
      ];
    } else if (diseaseLabel === "Corn rust leaf") {
      diagnosis = "Diagnosis: Corn rust is caused by Puccinia sorghi or Puccinia polysora, which thrive in warm, humid conditions.";
      solutions = [
        "Use resistant hybrids: Plant corn varieties that are resistant to rust.",
        "Monitor fields regularly: Inspect plants for early signs of rust, such as orange or brown pustules on leaves.",
        "Apply fungicides if necessary: Use fungicides like propiconazole or tebuconazole during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use organic compost to improve soil health: Healthy soil supports strong plant growth, making it more resistant to diseases."
      ];
    } else if (diseaseLabel === "Peach leaf") {
      diagnosis = "Diagnosis: General issues with peach leaves.";
      solutions = [
        "Ensure proper watering: Peach trees need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for peach leaf curl, aphids, or fungal infections like brown rot.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between trees: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many peach pests.",
        "Implement crop rotation: Avoid planting peaches in the same location year after year.",
        "Ensure adequate sunlight: Peach trees need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like peach leaf curl or brown rot."
      ];
    } else if (diseaseLabel === "Potato leaf early blight") {
      diagnosis = "Diagnosis: Potato early blight is caused by Alternaria solani, a fungal pathogen that thrives in warm, humid conditions.";
      solutions = [
        "Use certified seed potatoes: Start with disease-free seeds to avoid introducing pathogens.",
        "Apply fungicides: Use fungicides like chlorothalonil or mancozeb during periods of high disease pressure.",
        "Practice crop rotation: Avoid planting potatoes in the same soil for at least 3 years to reduce disease buildup.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Monitor for early signs of infection: Look for small, dark spots with concentric rings on leaves.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."
      ];
    } else if (diseaseLabel === "Potato leaf late blight") {
      diagnosis = "Diagnosis: Potato late blight is caused by Phytophthora infestans, the same pathogen responsible for the Irish Potato Famine.";
      solutions = [
        "Use resistant varieties: Plant potato varieties that are resistant to late blight.",
        "Apply fungicides: Use fungicides like metalaxyl or chlorothalonil during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Monitor for early signs of infection: Look for water-soaked lesions on leaves that may turn brown or black.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use organic compost to improve soil health: Healthy soil supports strong plant growth, making it more resistant to diseases."
      ];
    } else if (diseaseLabel === "Potato leaf") {
      diagnosis = "Diagnosis: General issues with potato leaves.";
      solutions = [
        "Ensure proper watering: Potatoes need consistent moisture but are sensitive to waterlogged soil.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and tuber development.",
        "Monitor for pests and diseases: Watch for Colorado potato beetles, aphids, or fungal infections like early blight.",
        "Prune affected leaves: Remove damaged or diseased leaves to improve plant health.",
        "Maintain proper spacing between plants: Adequate spacing reduces competition for nutrients and improves airflow.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many common potato pests.",
        "Implement crop rotation: Rotate potatoes with non-solanaceous crops to reduce disease risk.",
        "Ensure adequate sunlight: Potatoes need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like late blight or scab."
      ];
    } else if (diseaseLabel === "Raspberry leaf") {
      diagnosis = "Diagnosis: General issues with raspberry leaves.";
      solutions = [
        "Ensure proper watering: Raspberries need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for raspberry cane borers, aphids, or fungal infections like anthracnose.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between plants: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many raspberry pests.",
        "Implement crop rotation: Avoid planting raspberries in the same location year after year.",
        "Ensure adequate sunlight: Raspberries need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like raspberry leaf spot or cane blight."
      ];
    } else if (diseaseLabel === "Soyabean leaf") {
      diagnosis = "Diagnosis: General issues with soybean leaves.";
      solutions = [
        "Ensure proper watering: Soybeans need consistent moisture, especially during pod development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and pod production.",
        "Monitor for pests and diseases: Watch for soybean cyst nematodes, aphids, or fungal infections like frogeye leaf spot.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between plants: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many soybean pests.",
        "Implement crop rotation: Rotate soybeans with non-legume crops to reduce disease risk.",
        "Ensure adequate sunlight: Soybeans need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like soybean rust or bacterial blight."
      ];
    } else if (diseaseLabel === "Squash Powdery mildew leaf") {
      diagnosis = "Diagnosis: Squash powdery mildew is caused by several fungi, including Podosphaera xanthii, which thrive in warm, dry conditions.";
      solutions = [
        "Apply fungicides: Use fungicides like sulfur or potassium bicarbonate to control powdery mildew.",
        "Improve air circulation: Prune plants to improve airflow and reduce humidity around leaves.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry and minimize fungal growth.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Monitor for early signs of infection: Look for white, powdery spots on leaves.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Maintain proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high disease pressure.",
        "Use neem oil for pest control: Neem oil is effective against many squash pests and can also help control powdery mildew.",
        "Ensure proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."
      ];
    } else if (diseaseLabel === "Strawberry leaf") {
      diagnosis = "Diagnosis: General issues with strawberry leaves.";
      solutions = [
        "Ensure proper watering: Strawberries need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for spider mites, aphids, or fungal infections like powdery mildew.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between plants: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many strawberry pests.",
        "Implement crop rotation: Avoid planting strawberries in the same location year after year.",
        "Ensure adequate sunlight: Strawberries need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like verticillium wilt or leaf spot."
      ];
    } else if (diseaseLabel === "Tomato Early blight leaf") {
      diagnosis = "Diagnosis: Tomato early blight is caused by Alternaria solani, a fungal pathogen that thrives in warm, humid conditions.";
      solutions = [
        "Use resistant varieties: Plant tomato varieties that are resistant to early blight.",
        "Apply fungicides: Use fungicides like chlorothalonil or mancozeb during periods of high disease pressure.",
        "Practice crop rotation: Avoid planting tomatoes in the same soil for at least 3 years to reduce disease buildup.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Monitor for early signs of infection: Look for small, dark spots with concentric rings on leaves.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection."   
      ];
    } else if (diseaseLabel === "Tomato Septoria leaf spot") {
      diagnosis = "Diagnosis: Tomato Septoria leaf spot is a fungal disease caused by Septoria lycopersici, which thrives in warm, humid conditions.";
      solutions = [
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry and minimize fungal growth.",
        "Use fungicides if necessary: Apply fungicides like chlorothalonil or copper-based sprays during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Monitor for early signs of infection: Look for small, circular spots with dark margins and light centers on leaves.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use disease-free seeds: Start with certified seeds to avoid introducing pathogens.",
        "Rotate crops regularly: Avoid planting tomatoes in the same soil for at least 3 years to reduce disease buildup."
      ];
    } else if (diseaseLabel === "Tomato leaf bacterial spot") {
      diagnosis = "Diagnosis: Tomato leaf bacterial spot is caused by Xanthomonas campestris pv. vesicatoria, which thrives in warm, humid conditions.";
      solutions = [
        "Use disease-free seeds: Start with certified seeds to avoid introducing pathogens.",
        "Apply copper-based bactericides: Copper is effective against bacterial spot and can be applied preventatively.",
        "Remove infected plants: Promptly remove and destroy infected plants to prevent the spread of the bacteria.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry and minimize bacterial spread.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing bacterial growth.",
        "Monitor for early signs of infection: Look for small, water-soaked spots that may turn brown or black.",
        "Implement a regular spray schedule: Apply copper-based sprays every 7-14 days during periods of high disease pressure.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use resistant varieties: Choose tomato varieties that are resistant to bacterial spot."
      ];
    } else if (diseaseLabel === "Tomato leaf late blight") {
      diagnosis = "Diagnosis: Tomato late blight is caused by Phytophthora infestans, the same pathogen responsible for the Irish Potato Famine.";
      solutions = [
        "Use resistant varieties: Plant tomato varieties that are resistant to late blight.",
        "Apply fungicides: Use fungicides like metalaxyl or chlorothalonil during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of the fungus.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Monitor for early signs of infection: Look for water-soaked lesions on leaves that may turn brown or black.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use organic compost to improve soil health: Healthy soil supports strong plant growth, making it more resistant to diseases."
      ];
    } else if (diseaseLabel === "Tomato leaf mosaic virus") {
      diagnosis = "Diagnosis: Tomato mosaic virus is caused by the tomato mosaic virus (ToMV), which can be spread through infected seeds, tools, or plant debris.";
      solutions = [
        "Use virus-free seeds: Start with certified seeds to avoid introducing the virus.",
        "Disinfect tools regularly: Clean tools with a 10% bleach solution to prevent the spread of the virus.",
        "Remove infected plants: Promptly remove and destroy infected plants to prevent the spread of the virus.",
        "Ensure proper spacing between plants: Good spacing reduces the risk of virus transmission through contact.",
        "Monitor for early signs of infection: Look for mottled or distorted leaves with yellow or green patches.",
        "Avoid handling plants when wet: Wet conditions can facilitate the spread of the virus.",
        "Use resistant varieties: Choose tomato varieties that are resistant to mosaic virus.",
        "Implement crop rotation: Avoid planting tomatoes in the same soil for at least 3 years to reduce virus buildup.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use organic compost to improve soil health: Healthy soil supports strong plant growth, making it more resistant to viruses."
      ];
    } else if (diseaseLabel === "Tomato leaf yellow virus") {
      diagnosis = "Diagnosis: Tomato yellow leaf curl virus is caused by the tomato yellow leaf curl virus (TYLCV), which is transmitted by whiteflies.";
      solutions = [
        "Use virus-free transplants: Start with certified transplants to avoid introducing the virus.",
        "Control whitefly populations: Use insecticides or introduce natural predators like ladybugs to reduce whitefly numbers.",
        "Remove infected plants: Promptly remove and destroy infected plants to prevent the spread of the virus.",
        "Ensure proper spacing between plants: Good spacing reduces the risk of virus transmission through contact.",
        "Monitor for early signs of infection: Look for yellowing and curling of leaves, stunted growth, and reduced fruit production.",
        "Apply appropriate insecticides: Use insecticides to control whitefly populations and reduce virus transmission.",
        "Use resistant varieties: Choose tomato varieties that are resistant to yellow leaf curl virus.",
        "Implement crop rotation: Avoid planting tomatoes in the same soil for at least 3 years to reduce virus buildup.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use organic compost to improve soil health: Healthy soil supports strong plant growth, making it more resistant to viruses."
      ];
    } else if (diseaseLabel === "Tomato leaf") {
      diagnosis = "Diagnosis: General issues with tomato leaves.";
      solutions = [
        "Ensure proper watering: Tomatoes need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for aphids, spider mites, or fungal infections like early blight.",
        "Prune affected leaves: Remove damaged or diseased leaves to improve plant health.",
        "Maintain proper spacing between plants: Adequate spacing reduces competition for nutrients and improves airflow.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many common tomato pests.",
        "Implement crop rotation: Rotate tomatoes with non-solanaceous crops to reduce disease risk.",
        "Ensure adequate sunlight: Tomatoes need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose varieties resistant to common diseases like late blight or mosaic virus."
      ];
    } else if (diseaseLabel === "Tomato mold leaf") {
      diagnosis = "Diagnosis: Tomato mold is often caused by Botrytis cinerea, a fungal pathogen that thrives in cool, humid conditions.";
      solutions = [
        "Remove and destroy infected plant parts: Promptly remove affected leaves and fruits to prevent the spread of the fungus.",
        "Improve air circulation: Prune plants to improve airflow and reduce humidity around leaves.",
        "Apply fungicides: Use fungicides like chlorothalonil or copper-based sprays during periods of high disease pressure.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces humidity around plants.",
        "Monitor for early signs of infection: Look for gray, fuzzy mold on leaves or fruits.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use disease-resistant varieties: Choose tomato varieties that are resistant to mold."
      ];
    } else if (diseaseLabel === "Tomato two spotted spider mites leaf") {
      diagnosis = "Diagnosis: Two-spotted spider mites are tiny pests that feed on tomato leaves, causing stippling and yellowing.";
      solutions = [
        "Use insecticidal soap: Apply insecticidal soap to control mite populations.",
        "Introduce natural predators: Release ladybugs or predatory mites to control spider mites.",
        "Keep plants well-watered: Proper watering reduces plant stress and makes them less susceptible to mites.",
        "Remove and destroy infected leaves: Promptly remove affected leaves to prevent the spread of mites.",
        "Ensure proper spacing between plants: Good spacing improves airflow and reduces mite infestations.",
        "Monitor for early signs of infestation: Look for stippling or yellowing of leaves and fine webbing on the undersides.",
        "Use neem oil for pest control: Neem oil is effective against spider mites and can be applied preventatively.",
        "Implement a regular spray schedule: Apply insecticidal soap or neem oil every 7-14 days during periods of high mite activity.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infestation.",
        "Use disease-resistant varieties: Choose tomato varieties that are less susceptible to spider mites."
      ];
    } else if (diseaseLabel === "grape leaf black rot") {
      diagnosis = "Diagnosis: Grape black rot is caused by the fungus Guignardia bidwellii, which thrives in warm, humid conditions.";
      solutions = [
        "Remove and destroy infected plant parts: Promptly remove affected leaves and fruits to prevent the spread of the fungus.",
        "Apply fungicides: Use fungicides like mancozeb or copper-based sprays during periods of high disease pressure.",
        "Ensure proper air circulation: Prune vines to improve airflow and reduce humidity around leaves.",
        "Avoid overhead watering: Water at the base of plants to keep leaves dry and minimize fungal growth.",
        "Monitor for early signs of infection: Look for small, brown spots on leaves that may develop black fruiting bodies.",
        "Use drip irrigation: Drip systems minimize leaf wetness, reducing fungal growth.",
        "Implement a regular spray schedule: Apply fungicides every 7-14 days during periods of high humidity or rainfall.",
        "Maintain proper garden hygiene: Clean tools and remove plant debris to reduce sources of infection.",
        "Use resistant varieties: Choose grape varieties that are resistant to black rot.",
        "Prune vines regularly to improve airflow: Proper pruning reduces humidity and fungal growth."
      ];
    } else if (diseaseLabel === "grape leaf") {
      diagnosis = "Diagnosis: General issues with grape leaves.";
      solutions = [
        "Ensure proper watering: Grapes need consistent moisture, especially during fruit development.",
        "Use appropriate fertilizers: Apply balanced fertilizers to support healthy growth and fruit production.",
        "Monitor for pests and diseases: Watch for grape berry moths, aphids, or fungal infections like powdery mildew.",
        "Prune affected leaves: Remove diseased or damaged leaves to prevent the spread of infections.",
        "Maintain proper spacing between vines: Adequate spacing improves airflow and reduces disease risk.",
        "Apply organic mulch: Mulch helps retain soil moisture and suppress weeds.",
        "Use neem oil for pest control: Neem oil is effective against many grape pests.",
        "Implement crop rotation: Avoid planting grapes in the same location year after year.",
        "Ensure adequate sunlight: Grapes need at least 6-8 hours of sunlight daily.",
        "Use disease-resistant varieties: Choose grape varieties resistant to common diseases like black rot or downy mildew."
      ];
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email;
        console.log(userEmail)
        const userDocRef = doc(db, 'accounts', userEmail);

        // Update the user's document with the disease detection result
        await updateDoc(userDocRef, {
          diseases: arrayUnion({
            photo: resultImageUrl,
            disease: diseaseName,
            diagnosis : solutions
          })
        });
      } else {
        console.log("No user is logged in");
      }
    });

    return { diagnosis, solutions };
  };

  return (
    <div className="w-screen h-screen relative flex flex-col overflow-x-hidden min-h-screen" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
      
      {/* Sidebar for mobile */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white text-[#131811] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-30`}
      >
        <div className="p-6 relative">
          <h2 className="text-xl font-bold text-[#131811]">AgroVision AI</h2>
          <button
            onClick={() => setSidebarOpen(false)} // Close the sidebar
            className="absolute top-4 right-4 text-[#131811] text-xl"
          >
            &#10005;
          </button>
          <nav className="mt-8 space-y-4">
            <a onClick={() => {
              navigate("/welcome");
              setSidebarOpen(false);
            }} className="block text-base font-medium text-[#131811] hover:underline">
              Home
            </a>
            <a onClick={() => {
              navigate("/Contact");
              setSidebarOpen(false);
            }} className="block text-base font-medium text-[#131811] hover:underline">
              Contact Us
            </a>
            <a href="#" className="block text-base font-medium text-[#131811] hover:underline">
              Logout
            </a>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between bg-white w-full border-b border-solid border-[#f2f4f0] px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#131811]">
            <div className="size-8">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#131811] text-xl font-bold">AgriVision</h2>
          </div>
        </div>
        {/* Mobile menu toggle */}
        <button className="sm:hidden text-[#131811] text-2xl" onClick={() => setSidebarOpen(!sidebarOpen)}>
          &#9776;
        </button>
        {/* Desktop menu */}
        <nav className="hidden sm:flex gap-8">
          <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/welcome")}>
            Home
          </a>
          <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/Contact")}>
            Contact Us
          </a>
          <a className="text-[#131811] text-base font-medium" href="#">
            Logout
          </a>
        </nav>
      </header>

      {/* Main Content Section */}
      <div className="flex flex-1 justify-center items-center w-full py-10 px-4 sm:px-6 md:px-12">
        <div className="flex flex-col items-center w-full max-w-screen-lg gap-8">
          {/* Title */}
          <h1 className="text-[#141b0e] text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-center">
            Crop Disease Detection
          </h1>

          {/* Instructions */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center max-w-md sm:max-w-lg">
            Identify diseases in your crops by uploading images for analysis. Follow the instructions below to submit your images and receive results:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-left max-w-xs sm:max-w-md mx-auto space-y-2">
            <li>Ensure your image is clear and focused on the affected area of the crop.</li>
            <li>Upload images in JPEG or PNG format.</li>
            <li>Click on the "Upload Image" button below to select your file.</li>
            <li>Wait a few moments for the analysis results to be generated.</li>
          </ul>

          {/* Upload Section */}
          <div
            className="text-center flex flex-col items-center gap-4 border border-dashed border-gray-300 p-4 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex gap-4">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="Upload image for crop disease detection"
              />
              <label
                htmlFor="fileUpload"
                className="bg-green-500 text-white font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-green-600"
              >
                Upload Image
              </label>
              <button
                onClick={handleTakePhoto}
                className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Take Photo
              </button>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">or drag and drop your file here</p>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center">
              <p className="text-gray-700">Processing...</p>
              <div className="spinner mt-4 mx-auto"></div>
            </div>
          )}

          {/* Result Display */}
          {loading && (
  <div className="w-full flex flex-col items-center">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Image...</h2>
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="text-gray-700 ml-4">Analyzing the image...</p>
    </div>
  </div>
)}

{!loading && diseaseName && (
  <div className="w-full flex flex-col items-center">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Analysis Result</h2>
    <div className="bg-gray-100 p-4 rounded-lg shadow max-w-sm w-full">
      <p className="text-gray-700">{diseaseName}</p>
      {resultImageUrl && (
        <img src={`http://localhost:5000${resultImageUrl}`} alt="Detection Result" style={{ maxWidth: '100%', height: 'auto' }} />
      )}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">Diagnosis</h3>
        <p className="text-gray-700">{diagnoseCropDisease(diseaseName).diagnosis}</p>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">Solutions</h3>
        <ul className="list-disc list-inside text-gray-700">
          {diagnoseCropDisease(diseaseName).solutions.map((solution, index) => (
            <li key={index}>{solution}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#f2f4f0] py-6 px-4 border-t border-solid border-[#e5e7eb]">
        <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[#131811] text-xs sm:text-sm font-medium">
              &copy; 2025 AgriVision AI. All Rights Reserved.
            </p>
            <p className="text-[#131811] text-xs sm:text-sm mt-1">
              Empowering farmers with AI-driven insights for sustainable agriculture.
            </p>
          </div>
          <div className="flex gap-4 text-[#131811] text-xs sm:text-sm font-medium">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Support
            </a>
          </div>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="hover:text-[#80e619]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path d="M22.675 0h-21.35C.598 0 0 .598 0 1.325v21.351C0 23.403.598 24 1.325 24h11.495v-9.294H9.691V11.08h3.129V8.413c0-3.1 1.894-4.788 4.658-4.788 1.325 0 2.464.099 2.794.143v3.24h-1.918c-1.505 0-1.796.715-1.796 1.763v2.311h3.59l-.467 3.626h-3.123V24h6.127c.728 0 1.325-.598 1.325-1.324V1.325C24 .598 23.403 0 22.675 0z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-[#80e619]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path d="M24 4.557a9.835 9.835 0 0 1-2.828.775 4.94 4.94 0 0 0 2.165-2.723 9.872 9.872 0 0 1-3.127 1.195 4.918 4.918 0 0 0-8.384 4.482 13.947 13.947 0 0 1-10.141-5.148 4.916 4.916 0 0 0 1.523 6.573A4.904 4.904 0 0 1 .96 8.796v.062a4.917 4.917 0 0 0 3.946 4.827 4.902 4.902 0 0 1-2.212.084 4.92 4.92 0 0 0 4.593 3.417A9.868 9.868 0 0 1 0 21.539a13.94 13.94 0 0 0 7.548 2.211c9.058 0 14.009-7.504 14.009-14.009 0-.213-.005-.426-.014-.637A10.025 10.025 0 0 0 24 4.557z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#80e619]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.2.79 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.77V1.73C24 .78 23.2 0 22.23 0zM7.06 20.45H3.56V9.04h3.5v11.41zm-1.75-13.03c-1.1 0-1.98-.88-1.98-1.97 0-1.1.88-1.98 1.98-1.98s1.98.88 1.98 1.98c0 1.1-.88 1.97-1.98 1.97zm15.7 13.03h-3.5v-5.57c0-1.33-.03-3.05-1.86-3.05-1.87 0-2.15 1.46-2.15 2.96v5.66h-3.5V9.04h3.36v1.56h.05c.47-.9 1.62-1.84 3.34-1.84 3.57 0 4.23 2.35 4.23 5.41v6.28z" />
              </svg>
              </a>
    </div>
  </div>
</footer>
      </div>
  );
};
export default Disease;