//
//  Message.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import Foundation

final class Message: Encodable {
    var message:String
    
    init(message: String) {
        self.message = message
    }
    
    func sendText() {
        let postReq = APIRequest(endpoint: "messages")
        postReq.save(self, completion: {result in
            switch result {
            case .success(let response):
                print("The following message has been received: \(response.msg)")
            case .failure(let error):
                print("Error: \(error)")
            }
        })
    }
}
