//
//  User.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 11..
//

import Foundation

final class User : Identifiable, ObservableObject{
    
    struct userdata : Codable{
        let id : Int
        var username : String
        var password : String
        var email : String
        let last_login : String
        let date_created : String
        let session_id : String
        let session_expiration : String
        
        enum CodingKeys: CodingKey {
            case id
            case username
            case password
            case last_login
            case date_created
            case email
            case session_id
            case session_expiration
        }
        
        init(from decoder: Decoder) throws {
            let container: KeyedDecodingContainer<User.userdata.CodingKeys> = try decoder.container(keyedBy: User.userdata.CodingKeys.self)
            
            self.id = try container.decode(Int.self, forKey: User.userdata.CodingKeys.id)
            self.username = try container.decode(String.self, forKey: User.userdata.CodingKeys.username)
            self.password = try container.decode(String.self, forKey: User.userdata.CodingKeys.password)
            self.last_login = try container.decode(String.self, forKey: User.userdata.CodingKeys.last_login)
            self.date_created = try container.decode(String.self, forKey: User.userdata.CodingKeys.date_created)
            self.email = try container.decode(String.self, forKey: User.userdata.CodingKeys.email)
            self.session_id = try container.decode(String.self, forKey: User.userdata.CodingKeys.session_id)
            self.session_expiration = try container.decode(String.self, forKey: User.userdata.CodingKeys.session_expiration)
            
        }
        
        func encode(to encoder: Encoder) throws {
            var container: KeyedEncodingContainer<User.userdata.CodingKeys> = encoder.container(keyedBy: User.userdata.CodingKeys.self)
            
            try container.encode(self.id, forKey: User.userdata.CodingKeys.id)
            try container.encode(self.username, forKey: User.userdata.CodingKeys.username)
            try container.encode(self.password, forKey: User.userdata.CodingKeys.password)
            try container.encode(self.last_login, forKey: User.userdata.CodingKeys.last_login)
            try container.encode(self.date_created, forKey: User.userdata.CodingKeys.date_created)
            try container.encode(self.email, forKey: User.userdata.CodingKeys.email)
            try container.encode(self.session_id, forKey: User.userdata.CodingKeys.session_id)
            try container.encode(self.session_expiration, forKey: User.userdata.CodingKeys.session_expiration)
        }
    }
    
    @Published var userdata : userdata?
    
    init(_ userdata: userdata) {
        self.userdata = userdata
        
    }
    
    init() {
        self.userdata = nil
        
    }
}









