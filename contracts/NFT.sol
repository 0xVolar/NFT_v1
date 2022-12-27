pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

//OZ采用3.4.2版本的代码
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NFT is ERC1155 {

    string public name;
    string public symbol;
    uint private duration;
    address public admin;

    mapping(uint => string) private tokenUrl;
    mapping(uint => address) private ownerOfToken;
    mapping(uint => uint) private lockTime;
    mapping(address => uint) private balanceOfToken;

    event Mint(uint tokenId, address owner);
    event MintBatch(uint[] _tokenIds, address owner);
    event Burn(uint tokrnId, address operation);

    modifier isAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier isOwnerOrApproved(uint _tokenId) {
        address _owner = ownerOfToken[_tokenId];
        require(msg.sender == _owner || isApprovedForAll(_owner, msg.sender), "Not an owner or approved operator");
        _;
    }

    // modifier checkLock(uint _tokenId) {
    //     require(block.number > lockTime[_tokenId], "Token is locked");
    //     _;
    // }

    // modifier checkLocks(uint[] memory _tokenIds) {
    //     for (uint256 i = 0; i< _tokenIds.length; i++) {
    //         require(block.number > lockTime[_tokenIds[i]], "Token is locked");
    //     }    
    //     _;
        
    // }

    constructor(string memory _name, string memory _symbol, uint _duration, string memory _uri) public ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
        duration = _duration;
        admin = msg.sender;
    }

    function mint(address _to, uint _tokenId, string memory _tokenUrl) public isAdmin() returns(uint tokenId) {
        require(bytes(_tokenUrl).length != 0, "TokenUrl can not be null");
        require(ownerOfToken[_tokenId] == address(0), "This token has owner");
        tokenUrl[_tokenId] = _tokenUrl;       
        // balanceOfToken[_to] = balanceOfToken[_to].add(1);
        _mint(_to, _tokenId, 1, "");
        lockTime[_tokenId] = block.number + duration;
        emit Mint(_tokenId, _to);
        return _tokenId;
    }

    //批量产生有待商议
    // function mintBatch(address _to, uint[] memory _tokenIds, string[] memory _tokenUrls) public isAdmin() returns(uint[] memory tokenIds) {
    //     require(_tokenIds.length == _tokenUrls.length, "TokenIds and TokenUrls must have same length");
    //     uint[] memory _amounts = new uint[](_tokenIds.length);
    //     for(uint i = 0; i < _tokenUrls.length; i++) {
    //         require(ownerOfToken[_tokenIds[i]] == address(0), "This token has owner");
    //         require(bytes(_tokenUrls[i]).length != 0, "TokenUrl can not be null");
    //         ownerOfToken[_tokenIds[i]] = _to;
    //         tokenUrl[_tokenIds[i]] = _tokenUrls[i];
    //         lockTime[_tokenIds[i]] = block.number + duration;
    //         balanceOfToken[_to] = balanceOfToken[_to].add(1);
    //         _amounts[i] = 1;
    //     }
    //     _mintBatch(_to, _tokenIds, _amounts, "");
    //     emit MintBatch(_tokenIds, _to);
    //     return _tokenIds;
    // }

    function burn(uint _tokenId) public isOwnerOrApproved(_tokenId) returns(bool) {
        address _owner = ownerOfToken[_tokenId];
        // delete ownerOfToken[_tokenId];
        // delete lockTime[_tokenId];
        // balanceOfToken[_owner] = balanceOfToken[_owner].sub(1);
        _burn(_owner, _tokenId, 1);
        emit Burn(_tokenId, msg.sender);
        return true;
    }

   function _beforeTokenTransfer(address _operator, address _from, address _to, uint256[] memory _tokenIds, uint256[] memory _amounts, bytes memory _data) internal virtual override{ 
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint id = _tokenIds[i];
            require(block.number > lockTime[id], "Token is locked");
            require(_amounts[i] == 1, "Amount must be 1");
            ownerOfToken[id] = _to;
            if (_from == address(0)) {
                balanceOfToken[_to]++;
            } else if (_to == address(0)) {
                balanceOfToken[_from]--;
            } else {
                balanceOfToken[_to]++;
                balanceOfToken[_from]--;
            }
        }       
   }

 
    function getUrl(uint _tokenId) public view returns(string memory TokenUrl) {
        return tokenUrl[_tokenId];
    }

    function getOwner(uint _tokenId) public view returns(address owner) {
        return ownerOfToken[_tokenId];
    }

    function getBalanceOfOwner(address _owner) public view returns(uint balance) {
        return balanceOfToken[_owner];
    }

    function asSingletonArray(uint256 element) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }
    
    
}