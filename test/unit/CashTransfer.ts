import {expect} from 'chai';
import {ethers} from 'hardhat';

describe('CashTransfer', () => {
  let cashTransferContract: any;
  let deployedContract: any;

  let owner: any;
  let partner1: any;
  let merchant: any;
  let beneficiary: any;

  const TX_STATUS = {
    PENDING: 0,
    EXECUTED: 1,
    REJECTED: 2,
    EXPIRED: 3,
  };

  const VOUCHER_STATUS = {
    VALID: 0,
    REDEEMED: 1,
    REIMBURSED: 2,
  };

  beforeEach(async () => {
    cashTransferContract = await ethers.getContractFactory('CashTransfer');
    [owner, partner1, merchant, beneficiary] = await ethers.getSigners();

    deployedContract = await cashTransferContract.deploy();
    await deployedContract.deployed();
  });

  it('Should get contract info', async () => {
    const counter = await deployedContract.counter();
    expect(counter).to.equal(0);

    const voucherCounter = await deployedContract.voucherCounter();
    expect(voucherCounter).to.equal(0);
  });

  describe('addPartner', () => {
    it('Should add partner to whitelist addresses', async () => {
      const tx = await deployedContract.addPartner(partner1.address);

      await tx.wait();

      const isInWhitelist = await deployedContract.whitelistedAddresses(partner1.address);
      expect(isInWhitelist).to.be.true;

      const notWhitelist = await deployedContract.whitelistedAddresses('0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db');
      expect(notWhitelist).to.be.false;
    });
  });

  describe('askFund', () => {
    it('Should emit an event if request is correct', async () => {
      const addPartner = await deployedContract.addPartner(partner1.address);

      await addPartner.wait();

      const tx = await deployedContract.connect(partner1).askFund('TEST', 100);

      await tx.wait();
      const req = await deployedContract.fundsRequest(1);

      expect(req.title).to.equal('TEST');
      expect(req.status).to.equal(TX_STATUS.PENDING);
      expect(req.partner).to.equal(partner1.address);
    });
  });

  describe('approveRequest', () => {
    it('Should emit an event if request is approved', async () => {
      const addPartner = await deployedContract.addPartner(partner1.address);

      await addPartner.wait();

      const tx = await deployedContract.connect(partner1).askFund('TEST APPROVE', 100);

      await tx.wait();
      await deployedContract.approveRequest(1);
      const req = await deployedContract.fundsRequest(1);

      expect(req.title).to.equal('TEST APPROVE');
      expect(req.status).to.equal(TX_STATUS.EXECUTED);
    });
  });

  describe('rejectRequest', () => {
    it('Should emit an event if request is rejected', async () => {
      const addPartner = await deployedContract.addPartner(partner1.address);

      await addPartner.wait();

      const tx = await deployedContract.connect(partner1).askFund('TEST REJECTED', 100);

      await tx.wait();
      await deployedContract.rejectRequest(1);
      const req = await deployedContract.fundsRequest(1);

      expect(req.title).to.equal('TEST REJECTED');
      expect(req.status).to.equal(TX_STATUS.REJECTED);
    });

    describe('createVoucher', () => {
      it('Should create a voucher', async () => {
        const addPartner = await deployedContract.addPartner(partner1.address);

        await addPartner.wait();

        const tx = await deployedContract.connect(partner1).createVoucher(beneficiary.address, 100);

        await tx.wait();
        const req = await deployedContract.voucher(1);

        expect(req.partner).to.equal(partner1.address);
        expect(req.status).to.equal(VOUCHER_STATUS.VALID);
        expect(req.beneficiary).to.equal(beneficiary.address);
      });
    });

    describe('claimVoucher', () => {
      it('Should claim a voucher', async () => {
        const addPartner = await deployedContract.addPartner(partner1.address);

        await addPartner.wait();

        const tx = await deployedContract.connect(partner1).createVoucher(beneficiary.address, 100);

        await tx.wait();

        await deployedContract.connect(beneficiary).claimVoucher(1);

        const req = await deployedContract.voucher(1);

        expect(req.partner).to.equal(partner1.address);
        expect(req.status).to.equal(VOUCHER_STATUS.REDEEMED);
        expect(req.beneficiary).to.equal(beneficiary.address);
      });
    });

    describe('reimburseVoucher', () => {
      it('Should reimburse a voucher', async () => {
        const addPartner = await deployedContract.addPartner(partner1.address);

        await addPartner.wait();

        const tx = await deployedContract.connect(partner1).createVoucher(beneficiary.address, 100);

        await tx.wait();

        await deployedContract.connect(beneficiary).claimVoucher(1);

        await deployedContract.connect(merchant).reimburseVoucher(1);

        const req = await deployedContract.voucher(1);

        expect(req.partner).to.equal(partner1.address);
        expect(req.status).to.equal(VOUCHER_STATUS.REIMBURSED);
        expect(req.beneficiary).to.equal(beneficiary.address);
      });
    });
  });
});
