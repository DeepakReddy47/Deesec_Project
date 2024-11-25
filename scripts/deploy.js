async function main() {
    const MedicalData = await ethers.getContractFactory("MedicalData");
    const medicalData = await MedicalData.deploy();
    await medicalData.deployed();
    console.log("MedicalData deployed to:", medicalData.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  