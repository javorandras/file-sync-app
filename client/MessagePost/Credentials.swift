//
//  Credentials.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import Foundation

final class Credentials : Encodable{
    
    enum LoginResponse : Error{
        case userNotFound
        case wrongPassword
        case apiError
    }
    
    enum CodingKeys: CodingKey {
        case username
        case password
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(username, forKey: .username)
        try container.encode(password, forKey: .password)
    }
    
    let username : String
    let password : String    
    
    init(username: String, password: String) {
        self.username = username
        self.password = password
    }
    
    deinit {
        print("Memory Deallocated for this username: \(self.username)")
    }
    
    func checkLoginResponse() async throws -> User.userdata{
        let postReq = APIRequest(endpoint: "login")
        do{
            let credentialResponse = try await postReq.sendCredentials(credentials: self)
            print(credentialResponse)
            if (credentialResponse.code == 1) {
                throw LoginResponse.wrongPassword
            } else if(credentialResponse.code == 2) {
                throw LoginResponse.userNotFound
            } else /*if (data.code == 0)*/{
                return credentialResponse.userdata!
            }
        } catch APIError.responseProblem{
            print("Reponse problem")
            throw LoginResponse.apiError
        } catch APIError.decodingProblem {
            print("Decoding problem")
            throw LoginResponse.apiError
        } catch {
            print("Other problem")
            throw LoginResponse.apiError
        }
    }
}
