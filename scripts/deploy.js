const hre = require("hardhat");

async function main() {
  // Deploy IssuerRegistry first
  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy();
  await issuerRegistry.waitForDeployment();
  console.log(`IssuerRegistry deployed to: ${issuerRegistry.target}`);

  // Deploy CredentialVerification with IssuerRegistry address
  const CredentialVerification = await hre.ethers.getContractFactory("CredentialVerification");
  const credentialVerification = await CredentialVerification.deploy(issuerRegistry.target);
  await credentialVerification.waitForDeployment();
  console.log(`CredentialVerification deployed to: ${credentialVerification.target}`);

  // Save the contract addresses
  console.log({
    issuerRegistry: issuerRegistry.target,
    credentialVerification: credentialVerification.target
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});