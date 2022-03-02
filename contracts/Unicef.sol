// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CashTransfer
 * @dev Implements cash transfer system between UNICEF, IPs and merchants
 */
contract CashTransfer is Ownable {
    mapping(address => bool) public whitelistedAddresses;

    uint256 public counter = 0; // Request counter

    uint256 public voucherCounter = 0; // Voucher counter

    enum RequestStatus {
        PENDING,
        EXECUTED,
        REJECTED,
        EXPIRED
    }

    enum VoucherStatus {
        VALID,
        REDEEMED,
        REIMBURSED
    }

    // struct for IPs cash requests
    // Title and amount should be stored in IPFS or in a DB, this is just for demo purpose
    struct FundsRequest {
        address partner; // Partner
        string title; // Name of the project e.g. UKRAINE CRISIS
        uint256 amount; // Amount in USD
        uint256 createdAt;
        RequestStatus status;
    }
    mapping(uint256 => FundsRequest) public fundsRequest;

    struct Voucher {
        address partner; // IP
        address beneficiary;
        uint256 amount;
        VoucherStatus status;
    }
    mapping(uint256 => Voucher) public voucher;

    // FundsRequest[] private fundsRequests;

    modifier isWhitelisted(address _address) {
        require(whitelistedAddresses[_address], "Not in whitelist");
        _;
    }

    event AskFundEvent(address wallet, string title, uint256 amount, uint256 createdAt);
    event ApprovedRequest(uint256 id);
    event RejectedRequest(uint256 id);

    event VoucherCreated(uint256 id);
    event VoucherClaimed(uint256 id);
    event VoucherReimbursed(uint256 id);

    constructor() {}

    function addPartner(address _addressToWhitelist) public onlyOwner {
        whitelistedAddresses[_addressToWhitelist] = true;
    }

    // The IP requests for funds from UNICEF
    function askFund(string memory _title, uint256 _amount) public isWhitelisted(msg.sender) {
        require(_amount > 0, "Amount too low");

        counter++;

        FundsRequest memory request = FundsRequest({
            partner: msg.sender,
            title: _title,
            amount: _amount,
            createdAt: block.timestamp,
            status: RequestStatus.PENDING
        });

        fundsRequest[counter] = request;

        emit AskFundEvent(msg.sender, _title, _amount, block.timestamp);
    }

    function approveRequest(uint256 _id) external onlyOwner {
        FundsRequest storage request = fundsRequest[_id];

        require(request.status == RequestStatus.PENDING, "Invalid request");

        request.status = RequestStatus.EXECUTED;

        emit ApprovedRequest(_id);

        // TODO: transfer funds (not crypto e.g. outside this smart contract or via calling a different contract)
    }

    /**
     * @dev Reject request if invalid
     * @param _id ID of the request
     */
    function rejectRequest(uint256 _id) external onlyOwner {
        FundsRequest storage request = fundsRequest[_id];

        require(request.status == RequestStatus.PENDING, "Invalid request");

        request.status = RequestStatus.REJECTED;

        emit RejectedRequest(_id);
    }

    function createVoucher(address _beneficiary, uint256 _amount) public isWhitelisted(msg.sender) {
        require(_amount > 0, "Amount too low");

        voucherCounter++;

        Voucher memory newVoucher = Voucher({
            partner: msg.sender,
            beneficiary: _beneficiary,
            amount: _amount,
            status: VoucherStatus.VALID
        });

        voucher[voucherCounter] = newVoucher;

        emit VoucherCreated(voucherCounter);
    }

    function claimVoucher(uint256 _id) public {
        Voucher storage existingVoucher = voucher[_id];

        require(existingVoucher.status == VoucherStatus.VALID, "Invalid voucher");
        require(msg.sender == existingVoucher.beneficiary, "Invalid beneficiary");

        existingVoucher.status = VoucherStatus.REDEEMED;

        // TODO: send voucher to merchant

        emit VoucherClaimed(_id);
    }

    function reimburseVoucher(uint256 _id) public {
        Voucher storage existingVoucher = voucher[_id];

        require(existingVoucher.status == VoucherStatus.REDEEMED, "Invalid voucher");

        existingVoucher.status = VoucherStatus.REIMBURSED;
        // TODO: reimburse money to Merchant

        emit VoucherReimbursed(_id);
    }

    function returnFundsToContract() public {
        for (uint256 i = 1; i <= counter; i++) {
            FundsRequest storage request = fundsRequest[i];

            if (request.status == RequestStatus.PENDING) {
                // Voucher emited > 365 days
                if (request.createdAt + 365 days > block.timestamp) {
                    request.status = RequestStatus.EXPIRED;
                    // TODO Send money back to UNICEF
                }
            }
        }
    }
}
