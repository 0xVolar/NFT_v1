const { loadFixture, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { AddressZero } = require("@ethersproject/constants");

describe("NFT", function () {
    async function deploeyNFT() {
        const name = "ZhaoYang";
        const symbol = "ZY";
        const uri = "https://github.com/Kznccua/volar/blob/master/";
        const duration = 10;
        const [admin, otherAccount] = await ethers.getSigners();

        const NFT = await ethers.getContractFactory("NFT");
        const nft = await NFT.deploy(name, symbol, duration, uri);

        return {nft, name, symbol, uri, duration, admin, otherAccount};
    }

    describe("Deployment", function () {
        it("Should set right name", async function () {
            const {nft, name} = await loadFixture(deploeyNFT);
            expect(await nft.name()).to.equal(name);
        });

        it("Should set right symbol", async function () {
            const {nft, symbol} = await loadFixture(deploeyNFT);
            expect(await nft.symbol()).to.equal(symbol);
        });

        it("Should set right uri", async function () {
            const {nft, uri} = await loadFixture(deploeyNFT);
            expect(await nft.uri(1)).to.equal(uri);
        });

        it("Should set right admin", async function () {
            const {nft, admin} = await loadFixture(deploeyNFT);
            expect(await nft.admin()).to.equal(admin.address);
        });
    });

    describe("Mint", function () {
        describe("Verify", function () {
            it("Should revert with a right error if mint by other account", async function () {
                const {nft, otherAccount} = await loadFixture(deploeyNFT);
                await expect(nft.connect(otherAccount).mint(otherAccount.address, 1, "https://z374q654zv.feishu.cn/docx/PxeAdrGPVoR6FAx6iYIc1FpXnXg")).to.be.revertedWith("Not admin");
            });

            it("Should revert with a rigth error if tokenUrl is null", async function () {
                const {nft, admin} = await loadFixture(deploeyNFT);
                await expect(nft.mint(admin.address, 1, "")).to.be.revertedWith("TokenUrl can not be null");
            });

            it("Should revert with a rigth error if the token exist", async function () {
                const {nft, admin, uri} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.mint(admin.address, 1, uri)).to.be.revertedWith("This token has owner");
            });

            it("Mint successfully", async function () {
                const {nft, admin, uri} = await loadFixture(deploeyNFT);
                await expect(nft.mint(admin.address, 1, uri)).not.to.be.reverted;
            });
        });

        describe("Event", function () {
           it("Should emit an event when mint a token", async function () {
                const {nft, admin, uri} = await loadFixture(deploeyNFT);
                await expect(nft.mint(admin.address, 1, uri)).to.emit(nft, "Mint").withArgs(1, admin.address);
           }); 

           it("Should emit a transfer event when mint a token", async function () {
                const {nft, admin, uri} = await loadFixture(deploeyNFT);
                await expect(nft.mint(admin.address, 1, uri)).to.emit(nft, "TransferSingle").withArgs(admin.address, AddressZero, admin.address, 1, 1);
           });
        });
    });

    describe("Approved", function () {
        describe("Verify", function () {
            it("Should not approve if operator is self", async function () {
                const {nft, admin} = await loadFixture(deploeyNFT);
                await expect(nft.setApprovalForAll(admin.address, true)).to.be.revertedWith("ERC1155: setting approval status for self");
            });

            it("Should approve if operator is other account", async function () {
                const {nft, otherAccount} = await loadFixture(deploeyNFT);
                await expect(nft.setApprovalForAll(otherAccount.address, true)).not.to.be.reverted;
            });

            it("Should return true if call isApprovedForAll", async function () {
                const {nft, admin, otherAccount} = await loadFixture(deploeyNFT);
                await nft.setApprovalForAll(otherAccount.address, true);
                expect(await nft.isApprovedForAll(admin.address, otherAccount.address)).to.equal(true);
            });
        });

        describe("Event", function () {
            it("Should emit a right event if call setApprovalForAll", async function () {
                const {nft, admin, otherAccount} = await loadFixture(deploeyNFT);
                await expect(nft.setApprovalForAll(otherAccount.address, true)).to.emit(nft, "ApprovalForAll").withArgs(admin.address, otherAccount.address, true);
            });
        });
    });

    describe("Burn", function () {
        describe("Verify", function () {
            it("Should not burn if sender is not owner or approved operator", async function () {
                const {nft, uri, admin, otherAccount} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.connect(otherAccount).burn(1)).to.be.revertedWith("Not an owner or approved operator");
            });

            it("Should not burn if token is locked", async function () {
                const {nft, uri, admin, otherAccount} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.burn(1)).to.be.revertedWith("Token is locked");
            });

            it("Should burn if sender is owner and token is not locked", async function () {
                const {nft, uri, admin, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.burn(1)).not.to.be.reverted;
            });

            it("Should burn if sender is approved operator and token is not locked", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await nft.setApprovalForAll(otherAccount.address, true);
                await mine(duration + 1);
                await expect(nft.connect(otherAccount).burn(1)).not.to.be.reverted;
            });

        });

        describe("Event", function () {
            it("Should emit a Burn event when burn token", async function () {
                const {nft, uri, admin, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.burn(1)).to.emit(nft, "Burn").withArgs(1, admin.address);
            });

            it("Should emit a transfer event when burn token", async function () {
                const {nft, uri, admin, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.burn(1)).to.emit(nft, "TransferSingle").withArgs(admin.address, admin.address, AddressZero, 1, 1);
            });
        });
    });

    describe("Transfer", function () {
        describe("Verify", function () {
            it("Should not transfer if to is zero address", async function () {
                const {nft, uri, admin} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.safeTransferFrom(admin.address, AddressZero, 1, 1, 0x00)).to.be.revertedWith("ERC1155: transfer to the zero address");
            });
            
            it("Should not transfer if operator is other account", async function () {
                const {nft, uri, admin, otherAccount} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.connect(otherAccount).safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00)).to.be.revertedWith("ERC1155: caller is not owner nor approved");
            });

            it("Should not transfer if token is locked", async function () {
                const {nft, uri, admin, otherAccount} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await expect(nft.safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00)).to.be.revertedWith("Token is locked");
            });

            it("Should not transfer if amount is not 1", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.safeTransferFrom(admin.address, otherAccount.address, 1, 2, 0x00)).to.be.revertedWith("Amount must be 1");
            });

            it("Transfer successfully", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00)).not.to.be.reverted;
            });
        });

        describe("Event", function () {
            it("Should emit a transfer event when transfer token", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                await nft.mint(admin.address, 1, uri);
                await mine(duration + 1);
                await expect(nft.safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00)).to.emit(nft, "TransferSingle").withArgs(admin.address, admin.address, otherAccount.address, 1, 1);
            });
        });
    });

    describe("TransferBatch", function () {
        describe("Verify", function () {
            it("Should not transfer if ids and amounts length mismatch", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await mine(duration + 1);
                await expect(nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).to.be.revertedWith("ERC1155: ids and amounts length mismatch");
            });

            it("Should not transfer if to is zero address", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await expect(nft.safeBatchTransferFrom(admin.address, AddressZero, ids, amounts, 0x00)).to.be.revertedWith("ERC1155: transfer to the zero address");
            });

            it("Should not transfer if operator is other account", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await expect(nft.connect(otherAccount).safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).to.be.revertedWith("ERC1155: transfer caller is not owner nor approved");
            });

            it("Should not transfer if token is locked", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await expect(nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).to.be.revertedWith("Token is locked");
            });

            it("Should not transfer if amount is not 1", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 5, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await mine(duration + 1);
                await expect(nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).to.be.revertedWith("Amount must be 1");
            });

            it("BatchTransferFrom successful", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await mine(duration + 1);
                await expect(nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).not.to.be.reverted;
            });
        });

        describe("Event", function () {
            it("Should emit an right event if call safeBatchTransferFrom successfully", async function () {
                const {nft, uri, admin, otherAccount, duration} = await loadFixture(deploeyNFT);
                const ids = [1, 2, 3, 4, 5];
                const amounts = [1, 1, 1, 1, 1];
                for (let i = 1; i < 6; i++) {
                    await nft.mint(admin.address, i, uri)                   
                }
                await mine(duration + 1);
                await expect(nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00)).to.emit(nft, "TransferBatch").withArgs(admin.address, admin.address, otherAccount.address, ids, amounts);
            });
        });
    });

    describe("GetUrl", function () {
        it("Should get right url when call getUrl", async function () {
            const {nft, admin, uri} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            expect(await nft.getUrl(1)).to.equal(url);
        });
    });

    describe("GetOwner", function () {
        it("Should get right owner when mint token", async function () {
            const {nft, admin, uri} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            expect(await nft.getOwner(1)).to.equal(admin.address);
        });

        it("Should get right owner when burn token", async function () {
            const {nft, admin, uri, duration} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            mine(duration + 1);
            await nft.burn(1);
            expect(await nft.getOwner(1)).to.equal(AddressZero);
        });

        it("Should get right owner when transfer a token", async function () {
            const {nft, admin, uri, otherAccount, duration} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            mine(duration + 1);
            await nft.safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00);
            expect(await nft.getOwner(1)).to.equal(otherAccount.address);
        });

        it("Should get right owner when transfer tokens", async function () {
            const {nft, admin, uri, otherAccount, duration} = await loadFixture(deploeyNFT);
            const ids = [1, 2, 3, 4, 5];
            const amounts = [1, 1, 1, 1, 1];
            for (let i = 1; i < 6; i++) {
                await nft.mint(admin.address, i, uri)                   
            }
            await mine(duration + 1);
            await nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00);
            expect(await nft.getOwner(1)).to.equal(otherAccount.address);
        });
    });

    describe("GetBalanceOfOwner", function () {
        it("Should get right number when mint tokens", async function () {
            const {nft, admin, uri} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            await nft.mint(admin.address, 2, url);
            expect(await nft.getBalanceOfOwner(admin.address)).to.equal(2);
        });

        it("Should get right number when burn tokens", async function () {
            const {nft, admin, uri, duration} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            await nft.mint(admin.address, 2, url);
            await nft.mint(admin.address, 3, url);
            await mine(duration + 1);
            await nft.burn(1);
            expect(await nft.getBalanceOfOwner(admin.address)).to.equal(2);
        });

        it("Should get right number when transfer a token", async function () {
            const {nft, admin, uri, otherAccount, duration} = await loadFixture(deploeyNFT);
            const url = uri + "123.png";
            await nft.mint(admin.address, 1, url);
            mine(duration + 1);
            await nft.safeTransferFrom(admin.address, otherAccount.address, 1, 1, 0x00);
            expect(await nft.getBalanceOfOwner(admin.address)).to.equal(0);
            expect(await nft.getBalanceOfOwner(otherAccount.address)).to.equal(1);
        });

        it("Should get right number when transfer tokens", async function () {
            const {nft, admin, uri, otherAccount, duration} = await loadFixture(deploeyNFT);
            const ids = [1, 2, 3, 4, 5];
            const amounts = [1, 1, 1, 1, 1];
            for (let i = 1; i < 6; i++) {
                await nft.mint(admin.address, i, uri)                   
            }
            await mine(duration + 1);
            await nft.safeBatchTransferFrom(admin.address, otherAccount.address, ids, amounts, 0x00);
            expect(await nft.getBalanceOfOwner(admin.address)).to.equal(0);
            expect(await nft.getBalanceOfOwner(otherAccount.address)).to.equal(5);
        });
    });
});