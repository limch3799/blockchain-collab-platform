// scripts/deploy.ts
import { ethers, run } from "hardhat";

/**
 * @dev 30초 대기 함수 (Etherscan 전파 시간)
 */
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // 1. MOASForwarder 배포
  console.log("Deploying MOASForwarder...");
  const forwarderFactory = await ethers.getContractFactory("MOASForwarder");
  const forwarder = await forwarderFactory.deploy();
  await forwarder.waitForDeployment(); // 배포 완료 대기
  const forwarderAddress = await forwarder.getAddress();
  console.log(`✅ MOASForwarder deployed to: ${forwarderAddress}`);

  // 2. MOASContract 배포 (Forwarder 주소 주입)
  console.log("\nDeploying MOASContract...");
  const moasFactory = await ethers.getContractFactory("MOASContract");
  const moas = await moasFactory.deploy(forwarderAddress); // 생성자에 forwarder 주소 전달
  await moas.waitForDeployment(); // 배포 완료 대기
  const moasAddress = await moas.getAddress();
  console.log(`✅ MOASContract deployed to: ${moasAddress}`);

  // --- Etherscan 검증 ---
  console.log("\nWaiting 30 seconds for Etherscan to index transactions...");
  await delay(30000); // Etherscan이 트랜잭션을 인덱싱할 시간 대기

  try {
    // 3. MOASForwarder 검증
    console.log("Verifying MOASForwarder on Etherscan...");
    await run("verify:verify", {
      address: forwarderAddress,
      constructorArguments: [], // 생성자 인자 없음
      contract: "contracts/MOASForwarder.sol:MOASForwarder"
    });
    console.log("✅ MOASForwarder verified.");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("MOASForwarder is already verified.");
    } else {
      console.error("MOASForwarder verification failed:", error);
    }
  }

  try {
    // 4. MOASContract 검증
    console.log("\nVerifying MOASContract on Etherscan...");
    await run("verify:verify", {
      address: moasAddress,
      constructorArguments: [forwarderAddress], // 생성자 인자 (forwarder 주소)
    });
    console.log("✅ MOASContract verified.");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("MOASContract is already verified.");
    } else {
      console.error("MOASContract verification failed:", error);
    }
  }

  console.log("\n🎉 Deployment and verification complete!");
}

// 스크립트 실행
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});