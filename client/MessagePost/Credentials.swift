//
//  Credentials.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import Foundation

final class Credentials : Encodable, ObservableObject{
    
    enum LoginResponse : Error{
        case userNotFound
        case wrongPassword
    }
    
    enum CodingKeys: CodingKey {
        case username, password
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(username, forKey: .username)
        try container.encode(password, forKey: .password)
    }
    
    
    let username : String
    let password : String
    var userdata : CredentialsResponse.userdata?
    
    
    init(username: String, password: String) {
        self.username = username
        self.password = password
        self.userdata = nil
    }
    
    deinit {
        print("Memory Deallocated for this username: \(self.username)")
    }
    
    func sendCredentials() async throws -> Bool{
        let postReq = APIRequest(endpoint: "login")
        do{
            let data = try await postReq.check(credentials: self)
            //print("msg: \(data.msg)")
            print(data)
            //self.userdata = data.userdata
            
            if (data == nil) {
                throw LoginResponse.wrongPassword
            } else if() {
                throw LoginResponse.userNotFound
            }
            return true
        } catch APIError.responseProblem{
            print("Reponse problem")
            return false
        } catch APIError.decodingProblem {
            print("Decoding problem")
            return false
        } catch {
            print("Other problem")
            return false
        }
    }
}
