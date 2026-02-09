package com.example.bank.endpoint;

import java.math.BigDecimal;

import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import com.example.bank.service.BankService;
import com.example.bank.service.BankService.Account;
import com.example.bank.service.UnknownAccountException;
import com.example.bank.ws.AccountType;
import com.example.bank.ws.DepositRequest;
import com.example.bank.ws.DepositResponse;
import com.example.bank.ws.GetAccountRequest;
import com.example.bank.ws.GetAccountResponse;

@Endpoint
public class BankEndpoint {

  private static final String NAMESPACE_URI = "http://example.com/bank";
  private final BankService bankService;

  public BankEndpoint(BankService bankService) {
    this.bankService = bankService;
  }

  @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetAccountRequest")
  @ResponsePayload
  public GetAccountResponse getAccount(@RequestPayload GetAccountRequest request) {
    Account acc = bankService.getAccount(request.getAccountId());
    if (acc == null) {
      throw new UnknownAccountException("Unknown accountId: " + request.getAccountId());
    }

    AccountType dto = new AccountType();
    dto.setAccountId(acc.accountId);
    dto.setOwner(acc.owner);
    dto.setBalance(acc.balance);
    dto.setCurrency(acc.currency);

    GetAccountResponse resp = new GetAccountResponse();
    resp.setAccount(dto);
    return resp;
  }

  @PayloadRoot(namespace = NAMESPACE_URI, localPart = "DepositRequest")
  @ResponsePayload
  public DepositResponse deposit(@RequestPayload DepositRequest request) {
    BigDecimal newBalance = bankService.deposit(request.getAccountId(), request.getAmount());
    DepositResponse resp = new DepositResponse();
    resp.setNewBalance(newBalance);
    return resp;
  }
   @PayloadRoot(namespace = NAMESPACE_URI, localPart = "WidthDraw")
  @ResponsePayload
  public DepositResponse widthdraw(@RequestPayload DepositRequest request) {
    BigDecimal newBalance = bankService.deposit(request.getAccountId(), request.getAmount());
    DepositResponse resp = new DepositResponse();
    resp.setNewBalance(newBalance);
    return resp;
  }
}
