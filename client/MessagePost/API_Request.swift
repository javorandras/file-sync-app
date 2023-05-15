//
//  API_Request.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import Foundation

enum APIError : Error {
    case responseProblem
    case decodingProblem
    case encodingProblem
}

struct MessageResponse: Decodable {
    enum type: String, Decodable {
        case success, error
    }
    let code: Int
    let type: type
    let msg: String
}

struct CredentialsResponse: Decodable {
    enum type: String, Decodable {
        case success, error
    }
    struct userdata : Decodable, Identifiable{
        struct sessionID : Decodable{
            var session_id : String
            let session_expiration : String
        }
        let id : Int
        let username : String
        let password : String
        let last_login : String
        let date_created : String
        let email : String
        let session : sessionID
    }
    let code: Int
    let type: type
    let msg: String
    let userdata : userdata?
}

struct APIRequest {
    let url : URL
    
    init(endpoint: String) {
        let resourceString = "http://192.168.0.22:7777/api/\(endpoint)"
        
        guard let url = URL(string: resourceString) else {fatalError()}
        self.url = url
    }
    
    func save (_ messageToSave:Message, completion: @escaping(Result<MessageResponse, APIError>) -> Void) {
        do {
            var urlRequest = URLRequest(url: url)
            urlRequest.httpMethod = "POST"
            urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
            urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
            urlRequest.addValue("1234", forHTTPHeaderField: "api")
            urlRequest.httpBody = try JSONEncoder().encode(messageToSave)
            
            let dataTask = URLSession.shared.dataTask(with: urlRequest) { data, response, _ in
                guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200, let data = data else {
                    completion(.failure(.responseProblem))
                    return
                }
                do {
                    let jsonData = try JSONDecoder().decode(MessageResponse.self, from: data)
                    completion(.success(jsonData))
                } catch {
                    completion(.failure(.decodingProblem))
                }
            }
            dataTask.resume()
        } catch {
            completion(.failure(.encodingProblem))
        }
    }
    
    func check (credentials: Credentials, completion: @escaping(Result<CredentialsResponse, APIError>) -> Void) -> Void{
        do {
            var urlRequest = URLRequest(url: url)
            urlRequest.httpMethod = "POST"
            urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
            urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
            urlRequest.addValue("1234", forHTTPHeaderField: "api")
            urlRequest.httpBody = try JSONEncoder().encode(credentials)
            
            let dataTask = URLSession.shared.dataTask(with: urlRequest) { data, response, _ in
                guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200, let data = data else {
                    completion(.failure(.responseProblem))
                    return
                }
                do {
                    let jsonData = try JSONDecoder().decode(CredentialsResponse.self, from: data)
                    completion(.success(jsonData))
                } catch {
                    completion(.failure(.decodingProblem))
                }
            }
            dataTask.resume()
            return
        } catch {
            completion(.failure(.encodingProblem))
            return
        }
    }
    
    func check (credentials: Credentials) async throws -> String{
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        urlRequest.addValue("1234", forHTTPHeaderField: "api")
        urlRequest.httpBody = try JSONEncoder().encode(credentials)
        let session = URLSession.shared
        let (data, response) = try await session.data(for: urlRequest)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw APIError.responseProblem
        }
        /*guard let data = try? JSONDecoder().decode(CredentialsResponse.self, from: data) else {
            throw APIError.decodingProblem
        }*/
        let jsondata = String(decoding: data, as: UTF8.self)
        return jsondata
    }
}
