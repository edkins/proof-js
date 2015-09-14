module Main

import IQuery
import IQuery.Elements
import IQuery.Event
import Data.Fin
import Data.Vect

%default total

data Expr : Interval n -> Type where
  Invalid : r -> Expr r
  Num : r -> Nat -> Expr r
  Plus : Expr r0 -> Expr r1 -> Expr (bounds r0 r1)
  Mult : Expr r0 -> Expr r1 -> Expr (bounds r0 r1)

partial
main : JS_IO ()
main = do
  nodes <- query "p"
  Just p <- elemAt nodes 0
  setProperty p "contentEditable" "true"
  onEvent KeyUp p change_cb
  onEvent Blur p change_cb
  --setText p "Hello?"
